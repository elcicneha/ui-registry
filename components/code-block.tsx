import { BaseCodeBlock, type CodeBlockProps } from "@/components/base-code-block"
import { highlightCode } from "@/lib/highlight-code"

export type { CodeBlockProps }

export async function CodeBlock(props: CodeBlockProps) {
  const highlightedHtml = props.language
    ? await highlightCode(props.code, props.language)
    : undefined

  return <BaseCodeBlock {...props} highlightedHtml={highlightedHtml} />
}
