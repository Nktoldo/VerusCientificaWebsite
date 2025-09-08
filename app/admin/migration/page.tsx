'use client';

import { useState } from 'react';
import { runFullMigration, migrateProductsToMultipleCategories, updateCategoryReferences, migrateSubcategoriesToNewStructure } from '@/lib/migrateProducts';

export default function MigrationPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const handleFullMigration = async () => {
    setIsRunning(true);
    setLogs([]);
    
    try {
      addLog("Iniciando migração completa...");
      
      // Interceptar console.log para mostrar na interface
      const originalLog = console.log;
      console.log = (...args) => {
        originalLog(...args);
        addLog(args.join(' '));
      };

      await runFullMigration();
      
      console.log = originalLog;
      addLog("Migração concluída com sucesso!");
      
    } catch (error) {
      addLog(`Erro durante a migração: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleMigrateProducts = async () => {
    setIsRunning(true);
    setLogs([]);
    
    try {
      addLog("Iniciando migração de produtos...");
      
      const originalLog = console.log;
      console.log = (...args) => {
        originalLog(...args);
        addLog(args.join(' '));
      };

      await migrateProductsToMultipleCategories();
      
      console.log = originalLog;
      addLog("Migração de produtos concluída!");
      
    } catch (error) {
      addLog(`Erro durante a migração: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleUpdateReferences = async () => {
    setIsRunning(true);
    setLogs([]);
    
    try {
      addLog("Iniciando atualização de referências...");
      
      const originalLog = console.log;
      console.log = (...args) => {
        originalLog(...args);
        addLog(args.join(' '));
      };

      await updateCategoryReferences();
      
      console.log = originalLog;
      addLog("Atualização de referências concluída!");
      
    } catch (error) {
      addLog(`Erro durante a atualização: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleMigrateSubcategories = async () => {
    setIsRunning(true);
    setLogs([]);
    
    try {
      addLog("Iniciando migração de subcategorias...");
      
      const originalLog = console.log;
      console.log = (...args) => {
        originalLog(...args);
        addLog(args.join(' '));
      };

      await migrateSubcategoriesToNewStructure();
      
      console.log = originalLog;
      addLog("Migração de subcategorias concluída!");
      
    } catch (error) {
      addLog(`Erro durante a migração: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-blue-300">Migração de Produtos</h1>
        
        <div className="bg-slate-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-green-300">Ações de Migração</h2>
          
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleFullMigration}
              disabled={isRunning}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-semibold px-6 py-3 rounded-lg transition"
            >
              {isRunning ? 'Executando...' : 'Migração Completa'}
            </button>
            
            <button
              onClick={handleMigrateProducts}
              disabled={isRunning}
              className="bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white font-semibold px-6 py-3 rounded-lg transition"
            >
              {isRunning ? 'Executando...' : 'Migrar Produtos'}
            </button>
            
            <button
              onClick={handleUpdateReferences}
              disabled={isRunning}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 text-white font-semibold px-6 py-3 rounded-lg transition"
            >
              {isRunning ? 'Executando...' : 'Atualizar Referências'}
            </button>
            
            <button
              onClick={handleMigrateSubcategories}
              disabled={isRunning}
              className="bg-orange-600 hover:bg-orange-700 disabled:bg-slate-600 text-white font-semibold px-6 py-3 rounded-lg transition"
            >
              {isRunning ? 'Executando...' : 'Migrar Subcategorias'}
            </button>
            
            <button
              onClick={clearLogs}
              className="bg-slate-600 hover:bg-slate-700 text-white font-semibold px-6 py-3 rounded-lg transition"
            >
              Limpar Logs
            </button>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-yellow-300">Logs de Execução</h2>
            <span className="text-sm text-slate-400">
              {logs.length} mensagens
            </span>
          </div>
          
          <div className="bg-slate-900 rounded-lg p-4 h-96 overflow-y-auto font-mono text-sm">
            {logs.length === 0 ? (
              <p className="text-slate-500">Nenhum log disponível. Execute uma ação para ver os logs.</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="text-slate-300 mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-8 bg-slate-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-orange-300">Informações sobre a Migração</h2>
          
          <div className="space-y-4 text-slate-300">
            <div>
              <h3 className="font-semibold text-white mb-2">O que faz a migração:</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Migração de Subcategorias:</strong> Converte subcategorias para usar <code className="bg-slate-700 px-1 rounded">push</code> permitindo nomes duplicados em categorias diferentes</li>
                <li><strong>Migração de Produtos:</strong> Adiciona arrays <code className="bg-slate-700 px-1 rounded">categories</code> e <code className="bg-slate-700 px-1 rounded">subcategories</code> aos produtos existentes</li>
                <li><strong>Compatibilidade:</strong> Mantém compatibilidade com a estrutura antiga (<code className="bg-slate-700 px-1 rounded">category</code> e <code className="bg-slate-700 px-1 rounded">subcategory</code>)</li>
                <li><strong>Referências:</strong> Atualiza as referências nas categorias para incluir todos os produtos</li>
                <li><strong>Múltiplas Categorias:</strong> Permite que produtos pertençam a múltiplas categorias e subcategorias</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-2">Estrutura Nova:</h3>
              <pre className="bg-slate-900 p-4 rounded-lg text-sm overflow-x-auto">
{`// Produtos
{
  "id": "produto123",
  "title": "Nome do Produto",
  "category": "Categoria Principal", // Mantido para compatibilidade
  "subcategory": "Subcategoria Principal", // Mantido para compatibilidade
  "categories": ["Categoria1", "Categoria2", "Categoria3"], // Nova estrutura
  "subcategories": ["Subcat1", "Subcat2"], // Nova estrutura
  "active": true,
  // ... outros campos
}

// Subcategorias (nova estrutura com push)
{
  "id": "firebase-generated-id", // ID único do Firebase
  "title": "Nome da Subcategoria",
  "titleID": "nomedasubcategoria", // ID baseado no título para uso geral
  "categoria": "Categoria Pai",
  "active": true
}`}
              </pre>
            </div>
            
            <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-300 mb-2">⚠️ Importante:</h3>
              <ul className="list-disc list-inside space-y-1 text-yellow-200">
                <li>Faça backup dos dados antes de executar a migração</li>
                <li>A migração é irreversível</li>
                <li>Execute em ambiente de teste primeiro</li>
                <li>Monitore os logs durante a execução</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
