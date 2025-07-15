// 当 HTML 文档结构加载完成后执行
document.addEventListener('DOMContentLoaded', function() {

    // 1. 初始化 CodeMirror 编辑器
    const editor = CodeMirror.fromTextArea(document.getElementById('latex-editor'), {
        lineNumbers: true,       // 显示行号
        mode: 'text/x-stex',     // 设置为 LaTeX 模式
        theme: 'material-darker',// 设置主题
        indentUnit: 4,           // 缩进单位
        smartIndent: true,       // 智能缩进
        autofocus: true,         // 自动聚焦
    });

    // 设置一个默认的 LaTeX 模板
    const defaultLatexCode = `\\documentclass{article}
\\usepackage{ctex} % 支持中文
\\title{我的第一个在线 LaTeX 文档}
\\author{GitHub Pages}
\\date{\\today}

\\begin{document}

\\maketitle

\\section{简介}

你好，世界！这是一个通过网页浏览器实时编译的 LaTeX 文档。

你可以尝试在这里输入公式：
$$ E = mc^2 $$

或者创建一个列表：
\\begin{itemize}
  \\item 项目一
  \\item 项目二
\\end{itemize}

\\end{document}`;
    editor.setValue(defaultLatexCode);

    // 2. 获取 DOM 元素
    const compileButton = document.getElementById('compile-button');
    const logOutput = document.getElementById('log-output');
    const pdfPreview = document.getElementById('pdf-preview');

    // 3. 初始化 TexLive.js 编译器实例
    const texlive = new TeXLive({
        // 指定 worker 脚本的路径，CDN 会自动处理
        pdftex: "https://cdn.jsdelivr.net/npm/texlive.js@0.0.10/pdftex-worker.js"
    });

    // 4. 绑定编译按钮的点击事件
    compileButton.addEventListener('click', async () => {
        // 获取编辑器中的所有代码
        const latexCode = editor.getValue();

        // 更新 UI，告知用户正在编译
        compileButton.disabled = true;
        compileButton.textContent = '编译中...';
        logOutput.textContent = '正在准备编译环境...\n';
        pdfPreview.src = 'about:blank'; // 清空旧的 PDF

        try {
            // 使用 texlive.js 的 pdf() 方法进行编译
            const result = await texlive.pdf(latexCode, {
                args: ["-interaction=nonstopmode", "-jobname=output"] 
            });

            // 将完整的日志（包括 stdout 和 stderr）显示出来
            logOutput.textContent = result.log;

            if (result.pdf) {
                // 如果成功生成 PDF
                logOutput.textContent += "\\n\\n编译成功！正在渲染 PDF...";
                
                const pdfBlob = new Blob([result.pdf], { type: 'application/pdf' });
                const pdfUrl = URL.createObjectURL(pdfBlob);
                
                pdfPreview.src = pdfUrl;

            } else {
                // 如果没有生成 PDF，提示用户查看日志
                logOutput.textContent += "\\n\\n编译失败，请检查日志中的错误信息。";
            }

        } catch (error) {
            // 捕获编译过程中可能发生的意外错误
            logOutput.textContent = `发生意外错误：\\n${error.toString()}`;
        } finally {
            // 无论成功还是失败，都恢复按钮状态
            compileButton.disabled = false;
            compileButton.textContent = '编译 »';
        }
    });
});
