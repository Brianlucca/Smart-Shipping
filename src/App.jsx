import React, { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Github, Linkedin, RefreshCcw, X, Copy } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const MAX_FILE_SIZE = 10 * 1024 * 1024;
  const [serverUrl, setServerUrl] = useState("");
  const [sessionUrl, setSessionUrl] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [loadingSession, setLoadingSession] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileSizeError, setFileSizeError] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [previewFile, setPreviewFile] = useState(null);

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
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    setUploadError("");
    const validFiles = selectedFiles.filter(
      (file) => file.size <= MAX_FILE_SIZE
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
          render: "✅ Sucesso no envio!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
      } else {
        const errorResponse = xhr.responseText
          ? JSON.parse(xhr.responseText)
          : {};
        const errorMsg = errorResponse.error || "Falha no envio";
        setUploadError(errorMsg);
        toast.update(toastId, {
          render: `❌ ${errorMsg}`,
          type: "error",
          isLoading: false,
          autoClose: 5000,
        });
      }
      setUploadProgress(0);
      setSelectedFiles([]);
    };

    xhr.onerror = () => {
      const errorMsg = "Erro ao enviar. Verifique a conexão.";
      setUploadError(errorMsg);
      toast.update(toastId, {
        render: `❌ ${errorMsg}`,
        type: "error",
        isLoading: false,
        autoClose: 5000,
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
    const oversized = files.filter((file) => file.size > MAX_FILE_SIZE);
    setFileSizeError(
      oversized.length > 0
        ? `${oversized.length} arquivo(s) excedem o limite de 10MB por arquivo`
        : ""
    );
  };

  const removeFile = (index) => {
    setSelectedFiles((prevFiles) => {
      const newFiles = prevFiles.filter((_, i) => i !== index);
      const oversized = newFiles.filter((file) => file.size > MAX_FILE_SIZE);
      setFileSizeError(
        oversized.length > 0
          ? `${oversized.length} arquivo(s) excedem o limite de 10MB por arquivo`
          : ""
      );
      return newFiles;
    });
  };

  const isOversized = (file) => file.size > MAX_FILE_SIZE;

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (file) => {
    const fileType = file.type || "";
    const type = fileType.split("/")[0];
    if (type === "image") {
      return {
        icon: "🖼️",
        label: "Imagem",
      };
    } else if (type === "video") {
      return {
        icon: "🎥",
        label: "Vídeo",
      };
    } else if (type === "audio") {
      return {
        icon: "🎵",
        label: "Áudio",
      };
    } else if (fileType === "application/pdf") {
      return {
        icon: "📄",
        label: "PDF",
      };
    } else if (fileType.includes("word") || fileType.includes("document")) {
      return {
        icon: "📝",
        label: "Documento",
      };
    } else if (fileType.includes("sheet") || fileType.includes("excel")) {
      return {
        icon: "📊",
        label: "Planilha",
      };
    } else if (
      fileType.includes("archive") ||
      fileType.includes("zip") ||
      fileType.includes("rar")
    ) {
      return {
        icon: "📦",
        label: "Arquivo",
      };
    }
    return {
      icon: "📎",
      label: "Arquivo",
    };
  };

  const getFilePreview = (file) => {
    return new Promise((resolve) => {
      const fileType = file.type || "";
      const kind = fileType.split("/")[0];
      if (kind === "image" || kind === "video" || kind === "audio") {
        const url = URL.createObjectURL(file);
        resolve({ data: url, type: kind, isObjectUrl: true });
      } else {
        resolve({ data: null, type: "other", isObjectUrl: false });
      }
    });
  };

  const closePreview = () => {
    if (
      previewFile &&
      previewFile.preview &&
      previewFile.preview.isObjectUrl &&
      previewFile.preview.data
    ) {
      try {
        URL.revokeObjectURL(previewFile.preview.data);
      } catch (e) {}
    }
    setPreviewFile(null);
  };

  const handleCopySessionUrl = async () => {
    if (!sessionUrl) {
      toast.warn("URL da sessão não está disponível.", { autoClose: 2000 });
      return;
    }
    try {
      await navigator.clipboard.writeText(sessionUrl);
      toast.success("URL copiada para a área de transferência!", {
        autoClose: 2000,
      });
    } catch (err) {
      toast.error("Falha ao copiar. Tente selecionar e copiar manualmente.", {
        autoClose: 3000,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-gray-900">
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-2xl py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">
            Smart Shipping
          </h1>
          <p className="text-blue-100 text-sm md:text-base">
            Compartilhe arquivos com segurança e facilidade via QR Code
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <section className="lg:col-span-1 bg-white rounded-2xl shadow-2xl overflow-hidden hover:shadow-3xl transition-shadow duration-300">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M3 11h8V3H3v8zm10 0h8V3h-8v8zM3 21h8v-8H3v8zm10 0h8v-8h-8v8z" />
                  </svg>
                  Código de Acesso
                </h2>
                <button
                  onClick={() => fetchSessionUrl()}
                  title="Gerar nova sessão"
                  disabled={loadingSession}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-lg transition-all duration-200 disabled:opacity-50"
                >
                  <RefreshCcw
                    className={`w-5 h-5 ${loadingSession && "animate-spin"}`}
                  />
                </button>
              </div>
            </div>
            <div className="p-6 flex flex-col items-center justify-center">
              <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl mb-4 shadow-inner border border-gray-200">
                {sessionUrl ? (
                  <QRCodeCanvas
                    value={sessionUrl}
                    size={220}
                    bgColor="#ffffff"
                    fgColor="#1e40af"
                    level="H"
                    includeMargin={true}
                  />
                ) : (
                  <div className="w-56 h-56 flex items-center justify-center">
                    <div className="text-center">
                      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-3"></div>
                      <p className="text-gray-400 text-sm">Carregando...</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="w-full">
                <p className="text-xs text-gray-500 mb-2 font-semibold">
                  URL da Sessão:
                </p>
                <p
                  className="text-xs text-gray-600 break-all bg-gray-50 p-3 rounded-lg border border-gray-200 font-mono flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={handleCopySessionUrl}
                  title="Clique para copiar a URL"
                >
                  <span className="truncate">
                    {sessionUrl || "Gerando URL..."}
                  </span>
                  <Copy
                    size={14}
                    className="flex-shrink-0 ml-2 text-blue-600"
                  />
                </p>
              </div>
            </div>
          </section>

          <section className="lg:col-span-2 bg-white rounded-2xl shadow-2xl overflow-hidden hover:shadow-3xl transition-shadow duration-300">
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
                Informações Importantes
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-8 w-8 rounded-md bg-blue-500 text-white text-sm font-bold">
                      1
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      QR Code Exclusivo
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Cada sessão gera um código único
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-8 w-8 rounded-md bg-blue-500 text-white text-sm font-bold">
                      2
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Atualizar Sessão
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Use o ícone de refresh para gerar novo código
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-8 w-8 rounded-md bg-red-500 text-white text-sm font-bold">
                      3
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Expiração de 5 min
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Arquivos são deletados automaticamente
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-8 w-8 rounded-md bg-red-500 text-white text-sm font-bold">
                      4
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Limite de 10 MB
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      <strong>Por arquivo</strong> - você pode enviar vários
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-8 w-8 rounded-md bg-yellow-500 text-white text-sm font-bold">
                      5
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Privacidade
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Evite dados sensíveis e conteúdo +18
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-8 w-8 rounded-md bg-gray-600 text-white text-sm font-bold">
                      6
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Fins Educacionais
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Projeto para portfólio profissional
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-900 mb-3">
                  Conecte-se comigo:
                </p>
                <div className="flex gap-3">
                  <a
                    href="https://github.com/Brianlucca"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors text-sm font-medium"
                  >
                    <Github size={16} />
                    GitHub
                  </a>
                  <a
                    href="https://www.linkedin.com/in/brian-lucca-cardozo/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    <Linkedin size={16} />
                    LinkedIn
                  </a>
                </div>
              </div>
            </div>
          </section>
        </div>

        <section className="bg-white rounded-2xl shadow-2xl overflow-hidden hover:shadow-3xl transition-shadow duration-300">
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
              </svg>
              Enviar Arquivos
            </h2>
          </div>

          <div className="p-8">
            <div
              className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-200 cursor-pointer ${
                isDragging
                  ? "border-blue-500 bg-blue-50 shadow-lg"
                  : "border-gray-300 bg-gray-50 hover:border-gray-400"
              }`}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDropFile}
            >
              <svg
                className="w-16 h-16 text-blue-600 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="text-gray-700 font-semibold mb-2 text-lg">
                {selectedFiles.length > 0
                  ? `${selectedFiles.length} arquivo(s) selecionado(s)`
                  : "Arraste arquivos aqui ou clique para selecionar"}
              </p>
              <p className="text-gray-500 text-sm mb-4">
                Máximo <strong>10 MB por arquivo</strong> (você pode enviar
                vários)
              </p>
              <input
                type="file"
                id="fileInput"
                multiple
                className="hidden"
                onChange={(e) => {
                  const newFiles = Array.from(e.target.files);
                  const oversized = newFiles.filter(
                    (file) => file.size > MAX_FILE_SIZE
                  );
                  setFileSizeError(
                    oversized.length > 0
                      ? `${oversized.length} arquivo(s) excedem o limite de 10MB por arquivo`
                      : ""
                  );
                  setSelectedFiles((prev) => [...prev, ...newFiles]);
                }}
              />
              <label
                htmlFor="fileInput"
                className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors font-semibold shadow-md hover:shadow-lg"
              >
                Selecionar Arquivos
              </label>
            </div>

            {fileSizeError && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 font-semibold text-sm mb-2">
                  ⚠️ {fileSizeError}
                </p>
                <div className="space-y-1">
                  {selectedFiles
                    .filter((file) => file.size > MAX_FILE_SIZE)
                    .map((file, index) => (
                      <p key={index} className="text-red-600 text-xs">
                        • {file.name} ({formatFileSize(file.size)})
                      </p>
                    ))}
                </div>
              </div>
            )}

            {uploadError && (
              <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-orange-700 font-semibold text-sm">
                  ⚠️ Erro no upload:
                </p>
                <p className="text-orange-600 text-xs mt-1">{uploadError}</p>
              </div>
            )}

            {selectedFiles.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-purple-600"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                  Arquivos Selecionados ({selectedFiles.length})
                </h3>
                <div className="overflow-x-auto shadow-md rounded-lg border border-gray-200">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gradient-to-r from-gray-100 to-gray-50 border-b border-gray-200">
                        <th className="px-6 py-4 text-left font-semibold text-gray-700 w-16">
                          Tipo
                        </th>
                        <th className="px-6 py-4 text-left font-semibold text-gray-700">
                          Nome do Arquivo
                        </th>
                        <th className="px-6 py-4 text-right font-semibold text-gray-700 w-28">
                          Tamanho
                        </th>
                        <th className="px-6 py-4 text-center font-semibold text-gray-700 w-24">
                          Status
                        </th>
                        <th className="px-6 py-4 text-center font-semibold text-gray-700 w-20">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedFiles.map((file, index) => {
                        const tooLarge = isOversized(file);
                        const fileInfo = getFileIcon(file);
                        return (
                          <tr
                            key={index}
                            className={`border-b transition-colors ${
                              tooLarge
                                ? "bg-red-50 hover:bg-red-100"
                                : "hover:bg-gray-50"
                            }`}
                          >
                            <td className="px-6 py-4">
                              <div className="text-2xl flex items-center justify-center">
                                {fileInfo.icon}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <span
                                  className={`font-medium truncate ${
                                    tooLarge ? "text-red-700" : "text-gray-900"
                                  }`}
                                >
                                  {file.name}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span
                                className={`font-semibold ${
                                  tooLarge ? "text-red-700" : "text-gray-700"
                                }`}
                              >
                                {formatFileSize(file.size)}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              {tooLarge ? (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                                  <svg
                                    className="w-4 h-4"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                                  </svg>
                                  Exceder limite
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                  <svg
                                    className="w-4 h-4"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                  </svg>
                                  OK
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <button
                                onClick={async () => {
                                  const preview = await getFilePreview(file);
                                  setPreviewFile({ file, preview });
                                }}
                                className="inline-flex items-center justify-center p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                title="Visualizar arquivo"
                              >
                                <svg
                                  className="w-5 h-5"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => removeFile(index)}
                                className="inline-flex items-center justify-center p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                title="Remover arquivo"
                              >
                                <X size={18} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <button
                  onClick={handleFileUpload}
                  disabled={
                    selectedFiles.filter((f) => f.size <= MAX_FILE_SIZE)
                      .length === 0
                  }
                  className="w-full mt-8 px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg text-lg"
                >
                  {uploadStatus === "Enviando..."
                    ? `⏳ Enviando... ${uploadProgress}%`
                    : `📤 Enviar ${
                        selectedFiles.filter((f) => f.size <= MAX_FILE_SIZE)
                          .length
                      } arquivo(s)`}
                </button>
              </div>
            )}

            {selectedFiles.length === 0 && !fileSizeError && (
              <div className="mt-8 text-center">
                <svg
                  className="w-12 h-12 text-gray-300 mx-auto mb-3"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
                    opacity="0.3"
                  />
                </svg>
                <p className="text-gray-400 text-sm">
                  Nenhum arquivo selecionado ainda
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      {previewFile && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => closePreview()}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="text-2xl">
                  {getFileIcon(previewFile.file || previewFile).icon}
                </span>
                Visualizar Arquivo
              </h2>
              <button
                onClick={() => closePreview()}
                className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-8">
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {previewFile.file?.name ? (
                    <div>
                      <p className="text-xs text-gray-600 font-semibold">
                        Nome
                      </p>
                      <p className="text-sm font-medium text-gray-900 break-all">
                        {previewFile.file.name}
                      </p>
                    </div>
                  ) : null}

                  <div>
                    <p className="text-xs text-gray-600 font-semibold">
                      Tamanho
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatFileSize(previewFile.file?.size)}
                    </p>
                  </div>

                  {previewFile.file?.type ? (
                    <div>
                      <p className="text-xs text-gray-600 font-semibold">
                        Tipo
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {getFileIcon(previewFile.file).label}
                      </p>
                    </div>
                  ) : null}

                  <div>
                    <p className="text-xs text-gray-600 font-semibold">
                      Status
                    </p>
                    <p
                      className={`text-sm font-medium ${
                        isOversized(previewFile.file || previewFile)
                          ? "text-red-700"
                          : "text-green-700"
                      }`}
                    >
                      {isOversized(previewFile.file || previewFile)
                        ? "❌ Excede limite"
                        : "✅ Pronto para envio"}
                    </p>
                  </div>
                </div>
                {!previewFile.file?.name && !previewFile.file?.type && (
                  <p className="text-sm text-gray-500 mt-3">
                    Nome e tipo não disponíveis para este arquivo — utilize a
                    pré-visualização abaixo.
                  </p>
                )}
              </div>

              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-700 mb-3">
                  Pré-visualização:
                </p>
                <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden flex items-center justify-center min-h-96">
                  {previewFile.preview &&
                  previewFile.preview.type === "image" ? (
                    <img
                      src={previewFile.preview.data}
                      alt={previewFile.file?.name || ""}
                      className="max-w-full max-h-96 object-contain"
                    />
                  ) : previewFile.preview &&
                    previewFile.preview.type === "video" ? (
                    <video controls className="max-w-full max-h-96">
                      <source
                        src={previewFile.preview.data}
                        type={previewFile.file?.type}
                      />
                      Seu navegador não suporta vídeo.
                    </video>
                  ) : previewFile.preview &&
                    previewFile.preview.type === "audio" ? (
                    <div className="w-full p-8 text-center">
                      <div className="text-6xl mb-4">🎵</div>
                      <p className="text-gray-600 mb-4">Arquivo de áudio</p>
                      <audio controls className="w-full">
                        <source
                          src={previewFile.preview.data}
                          type={previewFile.file?.type}
                        />
                        Seu navegador não suporta áudio.
                      </audio>
                    </div>
                  ) : (
                    <div className="text-center p-8">
                      <div className="text-6xl mb-4">
                        {getFileIcon(previewFile.file || previewFile).icon}
                      </div>
                      <p className="text-gray-600 font-medium">
                        {getFileIcon(previewFile.file || previewFile).label}
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        Este tipo de arquivo não pode ser visualizado no
                        navegador
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => closePreview()}
                  className="px-6 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
