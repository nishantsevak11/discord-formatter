
import React, { useState, useRef, useEffect } from "react";
import { Bold, Italic, Underline, Code, Strikethrough, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import ColorPicker from "./ColorPicker";

const TextEditor = () => {
  const [text, setText] = useState("Welcome to TextSmith's Discord Formatter!\n\nStart typing here and use the formatting tools above to style your text.");
  const [selectedText, setSelectedText] = useState("");
  const [selectionStart, setSelectionStart] = useState(0);
  const [selectionEnd, setSelectionEnd] = useState(0);
  const [previewText, setPreviewText] = useState("");
  const [formatFlags, setFormatFlags] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    code: false,
    quote: false,
  });
  
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const [activeTextColor, setActiveTextColor] = useState("");
  const [activeBgColor, setActiveBgColor] = useState("");

  // Color palettes (only for preview - Discord only supports ANSI colors in code blocks)
  const textColors = [
    { color: "#9e9e9e", name: "Gray", discordCode: "30" },
    { color: "#e74c3c", name: "Red", discordCode: "31" },
    { color: "#9acd32", name: "Green", discordCode: "32" },
    { color: "#e67e22", name: "Yellow", discordCode: "33" },
    { color: "#3498db", name: "Blue", discordCode: "34" },
    { color: "#e91e63", name: "Magenta", discordCode: "35" },
    { color: "#1abc9c", name: "Cyan", discordCode: "36" },
    { color: "#ffffff", name: "White", discordCode: "37" }
  ];

  // Background colors (only for preview - Discord has limited bg color support)
  const bgColors = [
    { color: "#1e272e", name: "Black", discordCode: "40" },
    { color: "#e74c3c", name: "Red", discordCode: "41" },
    { color: "#4b7b2e", name: "Green", discordCode: "42" },
    { color: "#7c592e", name: "Yellow", discordCode: "43" },
    { color: "#2e587c", name: "Blue", discordCode: "44" },
    { color: "#635394", name: "Magenta", discordCode: "45" },
    { color: "#16a085", name: "Cyan", discordCode: "46" },
    { color: "#f5f5f5", name: "White", discordCode: "47" }
  ];

  useEffect(() => {
    updatePreviewText();
  }, [text]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const handleTextSelect = () => {
    const textarea = editorRef.current;
    if (textarea) {
      setSelectedText(
        textarea.value.substring(textarea.selectionStart, textarea.selectionEnd)
      );
      setSelectionStart(textarea.selectionStart);
      setSelectionEnd(textarea.selectionEnd);
    }
  };
  const updatePreviewText = () => {
    let formattedText = text;
  
    // Process ANSI color codes first (convert to spans)
    textColors.forEach(color => {
      const ansiCode = `\\x1b\\[${color.discordCode}m`;
      const regex = new RegExp(ansiCode + "(.*?)\\\\x1b\\[0m", "g");
      formattedText = formattedText.replace(
        regex, 
        `<span style="color:${color.color}">$1</span>`
      );
    });
  
    bgColors.forEach(color => {
      const ansiCode = `\\x1b\\[${color.discordCode}m`;
      const regex = new RegExp(ansiCode + "(.*?)\\\\x1b\\[0m", "g");
      formattedText = formattedText.replace(
        regex, 
        `<span style="background-color:${color.color}">$1</span>`
      );
    });
  
    // Process other formatting (convert markdown to HTML)
    formattedText = formattedText
      .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')        // bold
      .replace(/\*(.*?)\*/g, '<i>$1</i>')           // italic
      .replace(/__(.*?)__/g, '<u>$1</u>')           // underline
      .replace(/~~(.*?)~~/g, '<s>$1</s>')           // strikethrough
      .replace(/`([^`]+)`/g, '<code>$1</code>')     // inline code
      .replace(/^> (.*)$/gm, '<blockquote>$1</blockquote>'); // quotes
  
    // Remove any remaining formatting markers
    formattedText = formattedText
      .replace(/\*\*/g, '')  // remove remaining **
      .replace(/\*/g, '')    // remove remaining *
      .replace(/__/g, '')    // remove remaining __
      .replace(/~~/g, '')    // remove remaining ~~
      .replace(/`/g, '')     // remove remaining `
      .replace(/^> /gm, '')  // remove remaining >
      .replace(/```ansi/g, '') // remove code block markers
      .replace(/```/g, '')
      .replace(/\\x1b\[[\d;]+m/g, ''); // remove any remaining ANSI codes
  
    // Convert newlines to <br>
    formattedText = formattedText.replace(/\n/g, '<br>');
    
    setPreviewText(formattedText);
  };

  const applyFormat = (format: 'bold' | 'italic' | 'underline' | 'strikethrough' | 'code' | 'quote') => {
    if (!selectedText) {
      toast.info("Select text first", {
        description: "Highlight some text before applying formatting",
      });
      return;
    }
    
    setFormatFlags({
      ...formatFlags,
      [format]: !formatFlags[format]
    });
    
    let newText = text;
    let tag = "";
    
    switch (format) {
      case 'bold':
        tag = "**";
        break;
      case 'italic':
        tag = "*";
        break;
      case 'underline':
        tag = "__";
        break;
      case 'strikethrough':
        tag = "~~";
        break;
      case 'code':
        tag = "`";
        break;
      case 'quote':
        // For quotes, we need to prepend > to each line
        const lines = selectedText.split('\n');
        const quotedText = lines.map(line => `> ${line}`).join('\n');
        newText = 
          text.substring(0, selectionStart) + 
          quotedText + 
          text.substring(selectionEnd);
        
        setText(newText);
        updatePreviewText();
        editorRef.current?.focus();
        setSelectedText("");
        
        toast.success("Format applied", {
          description: `Applied ${format} formatting`,
        });
        return; // Early return since we're handling quotes differently
    }
    
    newText = 
      text.substring(0, selectionStart) + 
      tag + selectedText + tag + 
      text.substring(selectionEnd);
    
    setText(newText);
    updatePreviewText();
    editorRef.current?.focus();
    
    // Reset selection
    setSelectedText("");
    
    toast.success("Format applied", {
      description: `Applied ${format} formatting`,
    });
  };

  const applyColor = (color: string, isBackground: boolean, discordCode: string) => {
    if (!selectedText) {
      toast.info("Select text first", {
        description: "Highlight some text before applying color",
      });
      return;
    }
    
    if (isBackground) {
      setActiveBgColor(color);
    } else {
      setActiveTextColor(color);
    }
    
    // Use ANSI color codes for Discord (works in code blocks)
    const ansiCode = `\x1b[${discordCode}m`;
    const resetCode = "\x1b[0m";
    
    // Check if we're already in a code block
    const isInsideCodeBlock = 
      text.substring(0, selectionStart).includes("```ansi") && 
      text.substring(selectionEnd).includes("```");
    
    let newText;
    
    if (isInsideCodeBlock) {
      // If selected text is inside a code block, just add the ANSI code
      newText = 
        text.substring(0, selectionStart) + 
        ansiCode + selectedText + resetCode + 
        text.substring(selectionEnd);
    } else {
      // Create a new ANSI code block
      newText = 
        text.substring(0, selectionStart) + 
        "```ansi\n" + ansiCode + selectedText + resetCode + "\n```" + 
        text.substring(selectionEnd);
    }
    
    setText(newText);
    updatePreviewText();
    editorRef.current?.focus();
    setSelectedText("");
    
    toast.success("Color applied", {
      description: `Applied ${isBackground ? "background" : "text"} color`,
    });
  };

  const resetAll = () => {
    setText("Welcome to TextSmith's Discord Formatter!\n\nStart typing here and use the formatting tools above to style your text.");
    setActiveTextColor("");
    setActiveBgColor("");
    setFormatFlags({
      bold: false,
      italic: false,
      underline: false,
      strikethrough: false,
      code: false,
      quote: false,
    });
    
    toast.info("Reset complete", {
      description: "All formatting has been cleared",
    });
  };

  const copyFormattedText = () => {
    // When copying, we just copy the raw text which contains Discord's formatting syntax
    navigator.clipboard.writeText(text)
      .then(() => {
        toast.success("Copied to clipboard!", {
          description: "Your formatted text is ready to paste in Discord",
        });
      })
      .catch(() => {
        toast.error("Failed to copy", {
          description: "Please try again or copy manually",
        });
      });
  };

  return (
    <div className="w-full max-w-3xl mx-auto animate-fade-in">
      <div className="mb-6 space-y-2 text-center animate-slide-up">
        <h1 className="text-4xl font-bold tracking-tight">
          <span className="text-white">Discord </span>
          <span className="text-primary">Format</span>
          <span className="text-white">ter</span>
        </h1>
        <p className="text-muted-foreground">
          Create beautifully formatted text that works perfectly in Discord
        </p>
      </div>

      <div className="bg-card rounded-lg shadow-lg p-4 mb-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
        <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-muted">
          <Button
            variant="outline"
            size="sm"
            onClick={resetAll}
            className="toolbar-button"
          >
            Reset All
          </Button>
          
          <div className="flex-1"></div>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() => applyFormat('bold')}
                className={`toolbar-button ${formatFlags.bold ? 'active' : ''}`}
              >
                <Bold className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Bold (**text**)</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() => applyFormat('italic')}
                className={`toolbar-button ${formatFlags.italic ? 'active' : ''}`}
              >
                <Italic className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Italic (*text*)</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() => applyFormat('underline')}
                className={`toolbar-button ${formatFlags.underline ? 'active' : ''}`}
              >
                <Underline className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Underline (__text__)</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() => applyFormat('strikethrough')}
                className={`toolbar-button ${formatFlags.strikethrough ? 'active' : ''}`}
              >
                <Strikethrough className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Strikethrough (~~text~~)</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() => applyFormat('code')}
                className={`toolbar-button ${formatFlags.code ? 'active' : ''}`}
              >
                <Code className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Inline Code (`text`)</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() => applyFormat('quote')}
                className={`toolbar-button ${formatFlags.quote ? 'active' : ''}`}
              >
                <Quote className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Quote ({"> "}text)</TooltipContent>
          </Tooltip>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm font-medium mb-2">Text Color (ANSI)</p>
            <ColorPicker 
              colors={textColors} 
              activeColor={activeTextColor}
              onSelectColor={(color, discordCode) => applyColor(color, false, discordCode)}
            />
          </div>
          
          <div>
            <p className="text-sm font-medium mb-2">Background Color (ANSI)</p>
            <ColorPicker 
              colors={bgColors} 
              activeColor={activeBgColor}
              onSelectColor={(color, discordCode) => applyColor(color, true, discordCode)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Editor */}
          <div>
            <p className="text-sm font-medium mb-2">Input</p>
            <div className="editor-container">
              <textarea
                className="editor-content w-full bg-transparent resize-none"
                value={text}
                onChange={handleTextChange}
                onSelect={handleTextSelect}
                ref={editorRef}
                rows={10}
                placeholder="Type your text here and format it for Discord..."
              />
            </div>
          </div>

          {/* Live Preview */}
          <div>
            <p className="text-sm font-medium mb-2">Preview</p>
            <div className="editor-container overflow-auto">
              <div 
                className="editor-content preview-content formatted-text" 
                dangerouslySetInnerHTML={{ __html: previewText }}
              />
            </div>
          </div>
        </div>
        
        <div className="mt-4 flex justify-center">
          <Button onClick={copyFormattedText} className="w-full sm:w-auto">
            Copy Formatted Text
          </Button>
        </div>
      </div>
      
      <div className="rounded-lg bg-card p-4 shadow-lg animate-slide-up" style={{ animationDelay: "0.2s" }}>
        <h2 className="text-lg font-medium mb-2">Discord Formatting Guide</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Discord supports Markdown formatting. This formatter creates text that displays correctly when pasted into Discord.
        </p>
        
        <h3 className="text-md font-medium mb-2">Formatting Syntax:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
          <div className="bg-muted p-2 rounded text-sm">
            <code>**Bold**</code> → <span className="font-bold">Bold</span>
          </div>
          <div className="bg-muted p-2 rounded text-sm">
            <code>*Italic*</code> → <span className="italic">Italic</span>
          </div>
          <div className="bg-muted p-2 rounded text-sm">
            <code>__Underline__</code> → <span className="underline">Underline</span>
          </div>
          <div className="bg-muted p-2 rounded text-sm">
            <code>~~Strikethrough~~</code> → <span className="line-through">Strikethrough</span>
          </div>
          <div className="bg-muted p-2 rounded text-sm">
            <code>`Code`</code> → <span className="bg-[#2f3136] px-1 rounded">Code</span>
          </div>
          <div className="bg-muted p-2 rounded text-sm">
            <code>{">"} Quote</code> → <span className="border-l-4 border-gray-500 pl-2">Quote</span>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-muted rounded-md">
          <p className="text-sm font-medium">Color Example (ANSI):</p>
          <code className="text-xs block mt-1">```ansi<br/>Normal \x1b[31mRed Text\x1b[0m \x1b[43mYellow Background\x1b[0m<br/>```</code>
          <p className="text-xs mt-2 text-muted-foreground">Note: ANSI colors only work in code blocks and may not be visible on all Discord clients (works best on desktop).</p>
        </div>
      </div>
    </div>
  );
};

export default TextEditor;
