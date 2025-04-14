import React, { useEffect, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Github, Linkedin } from 'lucide-react';

function App() {
    const [serverUrl, setServerUrl] = useState('');
    const [sessionUrl, setSessionUrl] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [uploadStatus, setUploadStatus] = useState('');

    useEffect(() => {
        const determineBackendUrl = () => {
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                return 'http://localhost:3000';
            }
            return 'https://seu-backend-real.onrender.com';
        };

        const fetchSessionUrl = async () => {
            try {
                const backendUrl = determineBackendUrl();
                setServerUrl(backendUrl);

                const response = await fetch(`${backendUrl}/session-url`, {
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' }
                });

                if (!response.ok) throw new Error('Erro na resposta do servidor');

                const data = await response.json();
                setSessionUrl(data.url);
            } catch (error) {
                console.error('Erro:', error);
                setUploadStatus('Falha na conexão com o servidor');
            }
        };

        fetchSessionUrl();
    }, []);

    const handleFileUpload = async (e) => {
        e.preventDefault();
        if (!selectedFile) return;

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            setUploadStatus('Enviando...');

            const response = await fetch(`${serverUrl}/upload`, {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            if (!response.ok) throw new Error('Upload falhou');

            setUploadStatus('Sucesso! Atualizando...');
            setTimeout(() => window.location.reload(), 2000);

        } catch (error) {
            console.error('Erro:', error);
            setUploadStatus('Falha no envio do arquivo');
            setTimeout(() => setUploadStatus(''), 3000);
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        setIsDragging(e.type === 'dragenter' || e.type === 'dragover');
    };

    const handleDropFile = (e) => {
        e.preventDefault();
        setIsDragging(false);
        setSelectedFile(e.dataTransfer.files[0]);
    };

    return (
        <div className="min-h-screen p-8 bg-gray-50 text-gray-900">
            <header className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold text-blue-600 mb-4">
                    Smart Shipping
                </h1>
                {uploadStatus && (
                    <div className={`p-3 rounded-lg ${uploadStatus.includes('Sucesso') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {uploadStatus}
                    </div>
                )}
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                <section className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                    <div className="flex items-center mb-6">
                        <svg className="w-6 h-6 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 21l-6.35-6.35a8.9 8.9 0 010-12.72L12 21zm0-18L5.65 5.65a6.9 6.9 0 010 9.9L12 21l6.35-5.45a6.9 6.9 0 010-9.9L12 3z" />
                        </svg>
                        <h2 className="text-xl font-semibold">Instruções de Conexão</h2>
                    </div>
                    <div className="space-y-4 text-gray-600">
                        <p>• Ambos os dispositivos devem estar na mesma rede Wi-Fi</p>
                        <p>• O QR Code gerado é único para esta sessão</p>
                        <p>• Arquivos expiram após 10 minutos</p>
                        <p>• Não envie arquivos sensíveis</p>
                        <p>• Site criado para aprendizagem e portfólio</p>
                        <p>
                            • Me siga nas redes:
                            <a
                                href="https://github.com/Brianlucca"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 ml-1 text-blue-500 hover:underline"
                            >
                                <Github />
                            </a>
                            <a
                                href="https://www.linkedin.com/in/brian-lucca-cardozo/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 ml-1 mb-1 text-blue-500 hover:underline"
                            >
                                <Linkedin />
                            </a>
                        </p>
                    </div>

                </section>

                <section className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                    <div className="flex items-center mb-6">
                        <svg className="w-6 h-6 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M5 10h14v8H5zM3 4h18v4H3zm2 14h14v4H5z" />
                        </svg>
                        <h2 className="text-xl font-semibold">Acesso via QR Code</h2>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="p-4 bg-gray-100 rounded-lg mb-4">
                            {sessionUrl ? (
                                <QRCodeCanvas
                                    value={sessionUrl}
                                    size={200}
                                    bgColor="#ffffff"
                                    fgColor="#2962ff"
                                />
                            ) : (
                                <div className="w-48 h-48 flex items-center justify-center text-gray-400">
                                    Carregando...
                                </div>
                            )}
                        </div>
                        <p className="text-sm text-gray-600 break-all max-w-xs text-center">
                            {sessionUrl || 'Gerando URL...'}
                        </p>
                    </div>
                </section>
            </div>

            <div className="max-w-3xl mx-auto mt-12">
                <section className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                    <div
                        className={`border-2 rounded-lg p-8 text-center transition-colors duration-200 ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'
                            }`}
                        onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={handleDropFile}
                    >
                        <svg className="w-12 h-12 text-blue-600 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 12v5H5v-5H3v7h18v-7h-2zm-6-2l4 4h-3v4h-2v-4H9l4-4zm-2-5h2v4h-2V5z" />
                        </svg>
                        <p className="text-gray-600 mb-4">
                            {selectedFile
                                ? `Arquivo selecionado: ${selectedFile.name}`
                                : 'Arraste e solte ou clique para selecionar'}
                        </p>
                        <input
                            type="file"
                            id="fileInput"
                            className="hidden"
                            onChange={(e) => setSelectedFile(e.target.files[0])}
                        />
                        <label
                            htmlFor="fileInput"
                            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors"
                        >
                            Selecionar Arquivo
                        </label>
                    </div>

                    <button
                        onClick={handleFileUpload}
                        disabled={!selectedFile}
                        className="w-full mt-6 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Enviar Arquivo
                    </button>
                </section>
            </div>
        </div>
    );
}

export default App;