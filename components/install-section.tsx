"use client"

import { BaseCodeBlock } from "@/components/base-code-block"
import { CodeBlockCommand } from "@/components/code-block-command"
import {
  CodeBlockManual,
  CodeBlockManualStep,
  CodeBlockManualStepContent,
  CodeBlockManualStepTitle,
} from "@/components/code-block-manual"
import { makeDepsCommands } from "@/lib/registry"
import type { PackageManagerCommands } from "@/components/code-block-command"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

type Props = {
  cliCommands: PackageManagerCommands
  deps?: string[]
  source: string
  sourceHtml?: string
  sourcePath: string
}

export function InstallSection({ cliCommands, deps, source, sourceHtml, sourcePath }: Props) {
  const depsCommands = deps?.length ? makeDepsCommands(deps) : null

  // Step numbers shift when there are no deps
  let n = 1
  const s = {
    deps: depsCommands ? n++ : null,
    copy: n++,
    imports: n,
  }

  return (
    <Tabs defaultValue="cli">
      <TabsList variant="line">
        <TabsTrigger value="cli">Command</TabsTrigger>
        <TabsTrigger value="manual">Manual</TabsTrigger>
      </TabsList>
      <TabsContent value="cli">
        <CodeBlockCommand commands={cliCommands} />
      </TabsContent>
      <TabsContent value="manual">
        <CodeBlockManual>
          {depsCommands && s.deps !== null && (
            <CodeBlockManualStep step={s.deps}>
              <CodeBlockManualStepTitle>
                Install the required dependencies.
              </CodeBlockManualStepTitle>
              <CodeBlockManualStepContent>
                <CodeBlockCommand commands={depsCommands} />
              </CodeBlockManualStepContent>
            </CodeBlockManualStep>
          )}
          <CodeBlockManualStep step={s.copy}>
            <CodeBlockManualStepTitle>
              Copy and paste the following into{" "}
              <code>{sourcePath}</code>.
            </CodeBlockManualStepTitle>
            <CodeBlockManualStepContent>
              <BaseCodeBlock
                code={source}
                highlightedHtml={sourceHtml}
                filename={sourcePath}
                language="tsx"
                collapsible
              />
            </CodeBlockManualStepContent>
          </CodeBlockManualStep>
          <CodeBlockManualStep step={s.imports}>
            <CodeBlockManualStepTitle>
              Update the import paths to match your project setup.
            </CodeBlockManualStepTitle>
          </CodeBlockManualStep>
        </CodeBlockManual>
      </TabsContent>
    </Tabs>
  )
}
