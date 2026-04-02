import { CodeBlock } from "./CodeBlock";

// Custom Markdown components with consistent Tailwind styling for light backgrounds
export const markdownComponents = {
  h1: ({ node: _node, ...props }: any) => (
    <h1 className="text-2xl font-bold mt-6 mb-4 text-black" {...props} />
  ),
  h2: ({ node: _node, ...props }: any) => (
    <h2 className="text-xl font-bold mt-6 mb-3 text-black" {...props} />
  ),
  h3: ({ node: _node, ...props }: any) => (
    <h3 className="text-lg font-bold mt-5 mb-2 text-black" {...props} />
  ),
  p: ({ node: _node, ...props }: any) => (
    <p className="mb-4 text-gray-800 leading-relaxed last:mb-0" {...props} />
  ),
  ul: ({ node: _node, ...props }: any) => (
    <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-800" {...props} />
  ),
  ol: ({ node: _node, ...props }: any) => (
    <ol className="list-decimal pl-6 mb-4 space-y-2 text-gray-800" {...props} />
  ),
  li: ({ node: _node, ...props }: any) => <li className="pl-1" {...props} />,
  strong: ({ node: _node, ...props }: any) => (
    <strong className="font-semibold text-black" {...props} />
  ),
  code({ node: _node, inline, className, children, ...props }: any) {
    const match = /language-(\w+)/.exec(className || "");
    return !inline && match ? (
      <CodeBlock
        language={match[1]}
        code={String(children).replace(/\n$/, "")}
      />
    ) : (
      <code
        className="bg-gray-200 px-1.5 py-0.5 rounded-md text-gray-900 font-mono text-sm border border-gray-400"
        {...props}>
        {children}
      </code>
    );
  },
};
