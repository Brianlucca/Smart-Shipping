import React, { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Github, Linkedin, RefreshCcw, X } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
    const [serverUrl, setServerUrl] = useState("");
    const [sessionUrl, setSessionUrl] = useState("");
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [uploadStatus, setUploadStatus] = useState("");
    const [loadingSession, setLoadingSession] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [fileSizeError, setFileSizeError] = useState("");


    useEffect(() => {
        const backendUrl = determineBackendUrl();
        setServerUrl(backendUrl);
        fetchSessionUrl(backendUrl);
    }, []);

    const determineBackendUrl = () => {
        if (
            window.location.hostname === "localhost" ||
            window.location.hostname === "127.0.0.1"
        ) {
            return "http://localhost:3000";
        }
        return "https://smart-shipping.onrender.com";
    };

    const fetchSessionUrl = async (backendUrl = serverUrl) => {
        try {
            setLoadingSession(true);
            const response = await fetch(`${backendUrl}/session-url`, {
                credentials: "include",
            });
            if (!response.ok) throw new Error("Erro na resposta do servidor");
            const data = await response.json();
            setSessionUrl(data.url);
        } catch (error) {
            setUploadStatus("Falha na conexão com o servidor");
            toast.error("Falha na conexão com o servidor", {
                position: "top-right",
                autoClose: 5000,
            });
        } finally {
            setLoadingSession(false);
        }
    };

    const handleFileUpload = (e) => {
        e.preventDefault();
        const validFiles = selectedFiles.filter(
            (file) => file.size <= 20 * 1024 * 1024
        );

        if (validFiles.length === 0 || !sessionUrl) return;

        const formData = new FormData();
        validFiles.forEach((file) => formData.append("files", file));

        const sessionId = sessionUrl.split("/").pop();
        const xhr = new XMLHttpRequest();
        xhr.open("POST", `${serverUrl}/upload/${sessionId}`);
        xhr.withCredentials = true;

        const toastId = toast.info(
            <div>
                <p>Enviando arquivos...</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `0%` }}
                    ></div>
                </div>
            </div>,
            {
                position: "top-right",
                autoClose: false,
                closeOnClick: false,
                draggable: false,
                isLoading: true,
            }
        );

        xhr.upload.addEventListener("progress", (e) => {
            if (e.lengthComputable) {
                const percent = Math.round((e.loaded / e.total) * 100);
                setUploadProgress(percent);

                toast.update(toastId, {
                    render: (
                        <div>
                            <p>Enviando arquivos...</p>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${percent}%` }}
                                ></div>
                            </div>
                        </div>
                    ),
                    isLoading: true,
                });
            }
        });

        xhr.onload = () => {
            if (xhr.status === 200) {
                toast.update(toastId, {
                    render: "Sucesso no envio!",
                    type: "success",
                    isLoading: false,
                    autoClose: 3000,
                });
            } else {
                toast.update(toastId, {
                    render: "Falha no envio",
                    type: "error",
                    isLoading: false,
                    autoClose: 3000,
                });
            }
            setUploadProgress(0);
            setSelectedFiles([]);
        };

        xhr.onerror = () => {
            toast.update(toastId, {
                render: "Erro ao enviar",
                type: "error",
                isLoading: false,
                autoClose: 3000,
            });
        };

        xhr.send(formData);
    };

    const handleDrag = (e) => {
        e.preventDefault();
        setIsDragging(e.type === "dragenter" || e.type === "dragover");
    };

    const handleDropFile = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        setSelectedFiles((prev) => [...prev, ...files]);
        const oversized = newFiles.filter(file => file.size > 20 * 1024 * 1024);
        setFileSizeError(
            oversized.length > 0
                ? "Alguns arquivos excedem o limite de 20MB, apague-os para continuar"
                : ""
        );

    };

    const removeFile = (index) => {
        setSelectedFiles((prevFiles) => {
            const newFiles = prevFiles.filter((_, i) => i !== index);
            const oversized = newFiles.filter(file => file.size > 20 * 1024 * 1024);
            setFileSizeError(
                oversized.length > 0
                    ? "Alguns arquivos excedem o limite de 20MB, apague-os para continuar"
                    : ""
            );
            return newFiles;
        });
    };
    
    const isOversized = (file) => file.size > 20 * 1024 * 1024;

    return (
        <div className="min-h-screen p-8 bg-gray-50 text-gray-900">
            <header className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold text-blue-600 mb-4">
                    Smart Shipping
                </h1>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                <section className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                    <div className="flex items-center mb-6">
                        <svg
                            className="w-6 h-6 text-blue-600 mr-2"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path d="M12 21l-6.35-6.35a8.9 8.9 0 010-12.72L12 21zm0-18L5.65 5.65a6.9 6.9 0 010 9.9L12 21l6.35-5.45a6.9 6.9 0 010-9.9L12 3z" />
                        </svg>
                        <h2 className="text-xl font-semibold">Instruções de Conexão</h2>
                    </div>
                    <div className="space-y-4 text-gray-600">
                        <p>• Este QR Code é exclusivo para a sessão atual</p>
                        <p>• Para atualizar a sessão, clique no ícone acima do QR Code</p>
                        <p>• Os arquivos expiram automaticamente após 5 minutos</p>
                        <p>• Você pode enviar mais de 1 arquivo de uma só vez</p>
                        <p>• Evite enviar arquivos sensíveis, +18 ou com dados pessoais</p>
                        <p>• Limite de 20 MB para qualquer tipo de arquivo</p>
                        <p>• Este site foi criado com fins educacionais e para portfólio</p>
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
                                className="inline-flex items-center gap-2 ml-1 text-blue-500 hover:underline"
                            >
                                <Linkedin />
                            </a>
                        </p>
                    </div>
                </section>

                <section className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center">
                            <svg
                                className="w-6 h-6 text-blue-600 mr-2"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path d="M5 10h14v8H5v-5H3v7h18v-7h-2zm-6-2l4 4h-3v4h-2v-4H9l4-4zm-2-5h2v4h-2V5z" />
                            </svg>
                            <h2 className="text-xl font-semibold">Acesso via QR Code</h2>
                        </div>
                        <button
                            onClick={() => fetchSessionUrl()}
                            title="Gerar nova sessão"
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                            <RefreshCcw
                                className={`w-5 h-5 ${loadingSession && "animate-spin"}`}
                            />
                        </button>
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
                            {sessionUrl || "Gerando URL..."}
                        </p>
                    </div>
                </section>
            </div>

            <div className="max-w-3xl mx-auto mt-12">
                <section className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                    <div
                        className={`border-2 rounded-lg p-8 text-center transition-colors duration-200 ${isDragging
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-300 bg-gray-50"
                            }`}
                        onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={handleDropFile}
                    >
                        <svg
                            className="w-12 h-12 text-blue-600 mx-auto mb-4"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path d="M19 12v5H5v-5H3v7h18v-7h-2zm-6-2l4 4h-3v4h-2v-4H9l4-4zm-2-5h2v4h-2V5z" />
                        </svg>
                        <p className="text-gray-600 mb-4">
                            {selectedFiles.length > 0
                                ? `${selectedFiles.length} arquivo(s) selecionado(s)`
                                : "Arraste e solte ou clique para selecionar"}
                        </p>
                        <input
                            type="file"
                            id="fileInput"
                            multiple
                            className="hidden"
                            onChange={(e) => {
                                const newFiles = Array.from(e.target.files);
                                const oversized = newFiles.filter(file => file.size > 20 * 1024 * 1024);
                                setFileSizeError(
                                    oversized.length > 0
                                        ? "Alguns arquivos excedem o limite de 20MB, apague-os para continuar"
                                        : ""
                                );
                                setSelectedFiles((prev) => [...prev, ...newFiles]);
                            }}
                        />

                        <label
                            htmlFor="fileInput"
                            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors"
                        >
                            Selecionar Arquivos
                        </label>
                    </div>
                    {fileSizeError && (
                        <div className="text-red-600 text-sm mt-2 text-center">
                            <p>{fileSizeError}</p>
                            {selectedFiles
                                .filter(file => file.size > 20 * 1024 * 1024)
                                .map((file, index) => (
                                    <p key={index}>• {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</p>
                                ))
                            }
                        </div>
                    )}


                    <div className="file-list mt-4">
                        {selectedFiles.map((file, index) => {
                            const tooLarge = isOversized(file);
                            return (
                                <div
                                    key={index}
                                    className={`file-item flex items-center justify-between p-2 rounded mb-2 ${tooLarge ? "bg-red-100 text-red-700" : "bg-gray-50"
                                        }`}
                                >
                                    <span className="text-sm">{file.name}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs">
                                            {(file.size / 1024 / 1024).toFixed(2)} MB
                                        </span>
                                        <button
                                            onClick={() => removeFile(index)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <button
                        onClick={handleFileUpload}
                        disabled={
                            selectedFiles.filter((f) => f.size <= 20 * 1024 * 1024).length ===
                            0
                        }
                        className="w-full mt-6 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700"
                    >
                        {uploadStatus === "Enviando..."
                            ? `${uploadProgress}%`
                            : "Enviar Arquivos"}
                    </button>
                </section>
            </div>

            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
        </div>
    );
}

export default App;
