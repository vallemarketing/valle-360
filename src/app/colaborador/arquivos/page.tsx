'use client'

import { useState, useEffect } from 'react'
import { Upload, File, Folder, Search, Grid, List, Download, Trash2, Eye, Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

export default function ArquivosPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [files, setFiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    loadFiles()
  }, [])

  const loadFiles = async () => {
    try {
      // TODO: Fetch from API /storage
      setFiles([
        { id: '1', name: 'Projeto_Cliente_A.pdf', type: 'pdf', size: '2.5 MB', date: '2025-01-10', folder: 'Projetos', url: '#' },
        { id: '2', name: 'Design_Final.fig', type: 'figma', size: '15.3 MB', date: '2025-01-08', folder: 'Design', url: '#' },
        { id: '3', name: 'Apresentacao.pptx', type: 'powerpoint', size: '8.1 MB', date: '2025-01-05', folder: 'Apresentações', url: '#' }
      ])
    } catch (error) {
      console.error('Error loading files:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFiles = Array.from(e.dataTransfer.files)
    
    if (droppedFiles.length > 0) {
        toast.info(`Fazendo upload de ${droppedFiles.length} arquivos...`)
        // Simular upload
        setTimeout(() => {
            toast.success('Arquivos enviados com sucesso!')
            // Recarregar
        }, 1500)
    }
  }

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div 
        className="min-h-screen p-8" 
        style={{ backgroundColor: 'var(--bg-primary)' }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
    >
      {/* Overlay de Drag & Drop */}
      {isDragging && (
        <div className="fixed inset-0 bg-indigo-500/20 backdrop-blur-sm z-50 flex items-center justify-center border-4 border-dashed border-indigo-500 m-4 rounded-3xl">
            <div className="bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center animate-bounce">
                <Upload className="w-16 h-16 text-indigo-600 mb-4" />
                <h3 className="text-2xl font-bold text-indigo-900">Solte os arquivos aqui</h3>
                <p className="text-indigo-600">Para fazer upload instantâneo</p>
            </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                Meus Arquivos
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
                Gerencie seus documentos e arquivos
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
            <Plus className="w-4 h-4" />
            Nova Pasta
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              placeholder="Buscar arquivos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-light)',
                color: 'var(--text-primary)'
              }}
            />
          </div>

          {/* View Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2.5 rounded-xl transition-colors ${viewMode === 'grid' ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-gray-200'}`}
            >
              <Grid className={`w-5 h-5 ${viewMode === 'grid' ? 'text-indigo-600' : 'text-gray-500'}`} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2.5 rounded-xl transition-colors ${viewMode === 'list' ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-gray-200'}`}
            >
              <List className={`w-5 h-5 ${viewMode === 'list' ? 'text-indigo-600' : 'text-gray-500'}`} />
            </button>
          </div>

          {/* Upload Button */}
          <button
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-colors text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200"
          >
            <Upload className="w-5 h-5" />
            Upload Arquivo
          </button>
        </div>

        {/* Files Grid/List */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50/50">
            <File className="w-16 h-16 mx-auto mb-4 opacity-20 text-gray-400" />
            <p className="text-lg mb-2 text-gray-600">
              {searchTerm ? 'Nenhum arquivo encontrado' : 'Nenhum arquivo ainda'}
            </p>
            <p className="text-sm text-gray-400">
              {searchTerm ? 'Tente buscar por outro termo' : 'Faça upload de seus primeiros arquivos ou arraste-os para cá'}
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredFiles.map((file, index) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 rounded-xl border cursor-pointer hover:shadow-xl transition-all group bg-white border-gray-100 hover:border-indigo-100 relative"
              >
                {/* Hover Actions */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button className="p-1.5 bg-white rounded-lg shadow text-gray-500 hover:text-indigo-600">
                        <Download size={14} />
                    </button>
                    <button className="p-1.5 bg-white rounded-lg shadow text-gray-500 hover:text-red-600">
                        <Trash2 size={14} />
                    </button>
                </div>

                <div className="flex flex-col items-center text-center pt-2">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-indigo-50 text-indigo-600 shadow-inner">
                    <File className="w-8 h-8" />
                  </div>
                  <h3 className="font-semibold mb-1 truncate w-full text-gray-800 px-2">
                    {file.name}
                  </h3>
                  <p className="text-xs text-gray-400 mb-3">
                    {file.size} • {file.date}
                  </p>
                  <span className="px-2 py-1 bg-gray-100 text-gray-500 text-[10px] rounded-full uppercase tracking-wider font-bold">
                    {file.type}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {filteredFiles.map((file, index) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-indigo-50 text-indigo-600">
                    <File className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800">
                      {file.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                        <span>{file.folder}</span>
                        <span>•</span>
                        <span>{file.size}</span>
                        <span>•</span>
                        <span>{file.date}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100">
                  <button className="p-2 rounded-lg hover:bg-gray-200 text-gray-500 transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-gray-200 text-gray-500 transition-colors">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
