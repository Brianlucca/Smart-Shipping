import React, { useEffect, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';


function App() {
    const [serverIP, setServerIP] = useState('');
    const [files, setFiles] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        const fetchServerIP = async () => {
            try {
                const response = await fetch('http://localhost:3000/ip');
                const data = await response.json();
                const ip = `http://${data.ip}:3000`;
                setServerIP(ip);
                fetchFiles(ip);
            } catch (error) {
                console.error('Erro ao buscar IP:', error);
            }
        };

        fetchServerIP();
    }, []);

    const fetchFiles = async (ip) => {
        try {
            const response = await fetch(`${ip}/files`);
            const data = await response.json();
            setFiles(data);
        } catch (error) {
            console.error('Erro ao buscar arquivos:', error);
        }
    };

    const handleFileUpload = async (e) => {
        e.preventDefault();
        if (!selectedFile || !serverIP) return;

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            await fetch(`${serverIP}/upload`, {
                method: 'POST',
                body: formData,
            });
            setSelectedFile(null);
            fetchFiles(serverIP);
        } catch (error) {
            console.error('Erro ao enviar arquivo:', error);
        }
    };

    const handleDragEnter = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        setSelectedFile(e.dataTransfer.files[0]);
    };

    return (
        <div className="min-h-screen p-8 bg-gray-50 text-gray-900">
            <h1 className="text-4xl md:text-5xl text-center mb-8 font-bold text-[#2962ff]">
                Smart Shipping
            </h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-lg">
                    <div className="flex items-center mb-6">
                        <svg className="w-6 h-6 text-[#2962ff]" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 21l-6.35-6.35a8.9 8.9 0 010-12.72L12 21zm0-18L5.65 5.65a6.9 6.9 0 010 9.9L12 21l6.35-5.45a6.9 6.9 0 010-9.9L12 3z"/>
                        </svg>
                        <h2 className="text-xl font-semibold ml-2">
                            Conectar à Rede
                        </h2>
                    </div>
                    <div className="flex justify-center p-4 bg-gray-100 rounded-lg">
                     <p>Para conectar no servidor é necessario que o aparelho esteja na mesma rede wi-fi do computador ou celular, o compartilhamento de arquivo tem um tempo de expiração de 10 minutos, depois desse tempo, os arquivos serão apagados.</p> 
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-lg">
                    <div className="flex items-center mb-6">
                        <svg className="w-6 h-6 text-[#2962ff]" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M5 10h14v8H5zM3 4h18v4H3zm2 14h14v4H5z"/>
                        </svg>
                        <h2 className="text-xl font-semibold ml-2">
                            Acessar Servidor
                        </h2>
                    </div>
                    <div className="flex justify-center p-4 bg-gray-100 rounded-lg">
                        {serverIP ? (
                            <QRCodeCanvas 
                                value={`${serverIP}/`} 
                                size={200}
                                bgColor="#ffffff"
                                fgColor="#2962ff"
                            />
                        ) : (
                            <div className="w-10 h-10 border-4 border-gray-300 border-t-[#2962ff] rounded-full animate-spin"></div>
                        )}
                    </div>
                    {serverIP && (
                        <p className="text-center mt-4 text-sm text-gray-600 break-all">
                            {serverIP}
                        </p>
                    )}
                </div>
            </div>

            <div className="max-w-3xl mx-auto mt-8">
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-lg">
                    <div 
                        className={`border-2 rounded-lg p-8 text-center transition-all ${
                            isDragging 
                            ? 'border-[#2962ff] bg-blue-50' 
                            : 'border-gray-300'
                        }`}
                        onDragEnter={handleDragEnter}
                        onDragOver={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <svg className="w-12 h-12 text-[#2962ff] mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 12v5H5v-5H3v7h18v-7h-2zm-6-2l4 4h-3v4h-2v-4H9l4-4zm-2-5h2v4h-2V5z"/>
                        </svg>
                        <p className="text-gray-600 mb-4">
                            {selectedFile ? selectedFile.name : 'Arraste seu arquivo aqui ou clique abaixo'}
                        </p>
                        <input 
                            type="file" 
                            onChange={(e) => setSelectedFile(e.target.files[0])} 
                            className="hidden"
                            id="fileInput"
                        />
                        <label 
                            htmlFor="fileInput"
                            className="inline-block px-6 py-2 bg-[#2962ff] text-white rounded-lg cursor-pointer hover:bg-[#1a4fd8] transition-colors"
                        >
                            Selecionar Arquivo
                        </label>
                    </div>
                    <button 
                        onClick={handleFileUpload}
                        className="w-full mt-4 px-6 py-3 bg-[#2962ff] text-white font-semibold rounded-lg hover:bg-[#1a4fd8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!selectedFile}
                    >
                        Enviar para o Servidor
                    </button>
                </div>
            </div>
        </div>
    );
}

export default App;