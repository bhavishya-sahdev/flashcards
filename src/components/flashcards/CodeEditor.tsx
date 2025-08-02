import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Code, Copy, Check, Play, Maximize2, Minimize2 } from 'lucide-react';

interface CodeEditorProps {
    codeTemplate: string;
    showEditor: boolean;
    onToggleEditor: () => void;
    mounted: boolean;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
    codeTemplate,
    showEditor,
    onToggleEditor,
    mounted
}) => {
    const [code, setCode] = useState(codeTemplate);
    const [output, setOutput] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [monacoLoaded, setMonacoLoaded] = useState(false);
    const editorRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Load Monaco Editor
    useEffect(() => {
        if (!showEditor) return;

        const loadMonaco = async () => {
            try {
                // Load Monaco Editor from CDN
                if (!(window as any).monaco) {
                    // Load the Monaco loader
                    const loaderScript = document.createElement('script');
                    loaderScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs/loader.min.js';
                    document.head.appendChild(loaderScript);

                    await new Promise((resolve) => {
                        loaderScript.onload = resolve;
                    });

                    // Configure Monaco
                    (window as any).require.config({
                        paths: {
                            vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs'
                        }
                    });

                    // Load Monaco Editor
                    await new Promise((resolve) => {
                        (window as any).require(['vs/editor/editor.main'], resolve);
                    });
                }

                setMonacoLoaded(true);
            } catch (error) {
                console.error('Failed to load Monaco Editor:', error);
            }
        };

        loadMonaco();
    }, [showEditor]);

    // Initialize Monaco Editor
    useEffect(() => {
        if (!monacoLoaded || !containerRef.current || !showEditor) return;

        const monaco = (window as any).monaco;

        // Dispose previous editor
        if (editorRef.current) {
            editorRef.current.dispose();
        }

        // Create new editor
        editorRef.current = monaco.editor.create(containerRef.current, {
            value: code,
            language: 'javascript',
            theme: 'vs-dark',
            automaticLayout: true,
            fontSize: 14,
            fontFamily: 'Fira Code, Monaco, Consolas, "Courier New", monospace',
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            minimap: { enabled: true },
            wordWrap: 'on',
            tabSize: 2,
            insertSpaces: true,
            bracketPairColorization: { enabled: true },
            guides: {
                bracketPairs: true,
                indentation: true
            },
            suggestOnTriggerCharacters: true,
            quickSuggestions: {
                other: true,
                comments: true,
                strings: true
            },
            formatOnPaste: true,
            formatOnType: true
        });

        // Listen for content changes
        editorRef.current.onDidChangeModelContent(() => {
            const newCode = editorRef.current.getValue();
            setCode(newCode);
        });

        return () => {
            if (editorRef.current) {
                editorRef.current.dispose();
            }
        };
    }, [monacoLoaded, showEditor, isFullscreen]);

    // Update editor content when template changes
    useEffect(() => {
        if (editorRef.current && code !== codeTemplate) {
            setCode(codeTemplate);
            editorRef.current.setValue(codeTemplate);
        }
    }, [codeTemplate]);

    const runCode = () => {
        setIsRunning(true);
        setOutput('');

        try {
            const consoleOutput: string[] = [];
            const customConsole = {
                log: (...args: any[]) => {
                    const formatted = args.map(arg =>
                        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
                    ).join(' ');
                    consoleOutput.push(`> ${formatted}`);
                },
                time: (label: string) => {
                    customConsole.log(`⏱️ Timer '${label}' started`);
                },
                timeEnd: (label: string) => {
                    customConsole.log(`⏱️ Timer '${label}' completed`);
                },
                error: (...args: any[]) => {
                    const formatted = args.map(arg => String(arg)).join(' ');
                    consoleOutput.push(`❌ ${formatted}`);
                },
                warn: (...args: any[]) => {
                    const formatted = args.map(arg => String(arg)).join(' ');
                    consoleOutput.push(`⚠️ ${formatted}`);
                }
            };

            const wrappedCode = `
                const console = arguments[0];
                ${code}
            `;

            const func = new Function(wrappedCode);
            func(customConsole);

            setTimeout(() => {
                setOutput(consoleOutput.length > 0 ? consoleOutput.join('\n') : '✅ Code executed successfully (no output)');
                setIsRunning(false);
            }, 500);

        } catch (error) {
            setTimeout(() => {
                setOutput(`❌ Error: ${(error as Error).message}\n\nStack trace:\n${(error as Error).stack}`);
                setIsRunning(false);
            }, 500);
        }
    };

    const copyCode = async () => {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const resetCode = () => {
        setCode(codeTemplate);
        if (editorRef.current) {
            editorRef.current.setValue(codeTemplate);
        }
    };

    const formatCode = () => {
        if (editorRef.current) {
            editorRef.current.getAction('editor.action.formatDocument').run();
        }
    };

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    const staggerDelay = (index: number) => ({
        transform: mounted ? 'translateY(0)' : 'translateY(20px)',
        opacity: mounted ? 1 : 0,
        transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        transitionDelay: `${index * 100}ms`
    });

    const editorWrapperClass = isFullscreen
        ? "fixed inset-4 z-50 bg-gray-900 border border-gray-700 shadow-2xl rounded-lg"
        : "mb-12";

    return (
        <div className={editorWrapperClass} style={staggerDelay(6)}>
            <div className="border border-gray-800 bg-gray-900/30 backdrop-blur-sm overflow-hidden h-full flex flex-col ">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-900/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 flex items-center justify-center rounded">
                            <Terminal className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white">Code Editor</h3>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={formatCode}
                            className="flex items-center gap-2 px-3 py-2 bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors text-xs font-medium"
                            disabled={!monacoLoaded}
                        >
                            Format
                        </button>

                        <button
                            onClick={toggleFullscreen}
                            className="flex items-center gap-2 px-3 py-2 bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors text-xs font-medium"
                        >
                            {isFullscreen ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
                            {isFullscreen ? 'Exit' : 'Fullscreen'}
                        </button>

                        <button
                            onClick={onToggleEditor}
                            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white hover:bg-cyan-700 transition-colors text-xs font-medium"
                        >
                            <Code className="w-4 h-4" />
                            {showEditor ? 'Hide' : 'Show'}
                        </button>
                    </div>
                </div>

                {showEditor && (
                    <div className="flex-1 flex flex-col" style={{ height: isFullscreen ? 'calc(100vh - 200px)' : '800px' }}>
                        <div className="flex-1 grid lg:grid-cols-2 gap-0">
                            {/* Monaco Editor Panel */}
                            <div className="flex flex-col border-r border-gray-800 relative">
                                {/* Editor Header */}
                                <div className="absolute top-0 w-full flex items-center justify-end p-3 bg-transparent z-10">
                                    <button
                                        onClick={copyCode}
                                        className="flex items-center gap-2 px-3 py-1 bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 transition-colors text-xs"
                                    >
                                        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                        {copied ? 'Copied!' : 'Copy'}
                                    </button>
                                </div>

                                {/* Monaco Editor Container */}
                                <div className="flex-1 bg-gray-950">
                                    {monacoLoaded ? (
                                        <div ref={containerRef} className="w-full h-full min-h-[300px]" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <div className="text-center">
                                                <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                                <p className="text-gray-400">Loading Code Editor...</p>
                                                <p className="text-xs text-gray-500 mt-2">This may take a moment on first load</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Editor Footer */}
                                <div className="flex items-center justify-between p-3 border-t border-gray-800 bg-gray-900/30">
                                    <div className="flex gap-3">
                                        <button
                                            onClick={runCode}
                                            disabled={isRunning || !monacoLoaded}
                                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-600 transition-colors font-medium text-sm"
                                        >
                                            <Play className="w-4 h-4" />
                                            {isRunning ? 'Running...' : 'Run Code'}
                                        </button>
                                        <button
                                            onClick={resetCode}
                                            disabled={!monacoLoaded}
                                            className="px-4 py-2 border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors text-sm disabled:opacity-50"
                                        >
                                            Reset
                                        </button>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        JavaScript
                                    </div>
                                </div>
                            </div>

                            {/* Output Panel */}
                            <div className="flex flex-col">
                                {/* Output Header */}
                                <div className="flex items-center justify-between p-3 border-b border-gray-800 bg-gray-900/30">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <span className="text-sm text-gray-400">Console Output</span>
                                    </div>
                                    <button
                                        onClick={() => setOutput('')}
                                        className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                                    >
                                        Clear
                                    </button>
                                </div>

                                {/* Output Content */}
                                <div className="flex-1 p-4 bg-gray-950 overflow-auto">
                                    {isRunning ? (
                                        <div className="flex items-center gap-2 text-cyan-400">
                                            <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                                            <span>Executing code...</span>
                                        </div>
                                    ) : output ? (
                                        <pre className="text-gray-300 font-mono text-sm whitespace-pre-wrap leading-relaxed">
                                            {output}
                                        </pre>
                                    ) : (
                                        <div className="text-gray-500 text-sm flex flex-col items-center justify-center h-full">
                                            <Terminal className="w-8 h-8 mb-2 opacity-50" />
                                            <span>Click "Run Code" to see output here</span>
                                            <span className="text-xs mt-1 opacity-75">Advanced code editor with IntelliSense, syntax highlighting, and more!</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};