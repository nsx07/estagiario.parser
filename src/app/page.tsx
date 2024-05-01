"use client";
import { FileUpload } from "@/components/custom/file-upload";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { getExcel, proccess } from "@/proccess/parser";
import { useState } from "react";
import { useForm } from "react-hook-form";
import Spreadsheet, { CellBase, Matrix } from "react-spreadsheet";

export default function Home() {
  const [result, setResult] = useState<string | null>(null);
  const [excel, setExcel] = useState<Matrix<CellBase<any>>>([]);
  const [showTable, setShowTable] = useState<boolean>(false);
  const [buffer, setBuffer] = useState<File>();
  const { toast } = useToast();
  const form = useForm();

  const proc = async () => {
    const raw = form.getValues();
    const proc = await proccess({
      file: buffer!,
      end: raw.end,
      begin: raw.begin,
      splitterRegex: new RegExp(raw.splitter),
      firstLookAhead: new RegExp(raw.firstReg),
      secondLookAhead: new RegExp(raw.secondReg),
    });

    setResult(JSON.stringify(proc, null, 2));
  };

  const upload = async (buffer: File) => {
    const jsonData = await getExcel(buffer);
    setExcel(jsonData as any);
    setShowTable(true);
    setBuffer(buffer);
  };

  return (
    <main className="relative">
      <div className="z-30 sticky left-0 right-0 top-0 w-full flex justify-between p-3 bg-gradient-to-r from-slate-500 to-zinc-300 dark: dark:from-slate-700 dark:to-zinc-500 shadow ">
        <div className="text-zinc:800 dark:text-zinc-100">
          <h1 className="text-xl -tracking-wide">EstagIArio</h1>
          <p className="text-xs">Assistente virtual jurídico</p>
        </div>
        <ThemeToggle />
      </div>
      <div className="mt-6 pb-4 w-full relative flex sm:flex-row flex-col-reverse">
        <div className="w-full sm:w-1/2 overflow-auto px-2">
          {!showTable && (
            <div className="w-full flex flex-col items-center">
              <p className="py-2">Selecione o arquivo</p>
              <FileUpload
                label=""
                width="w-52"
                height="h-52"
                onFileUpload={(x) => upload(x)}
              />
            </div>
          )}
          {showTable && (
            <>
              <Tabs defaultValue="sheet" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="sheet">Arquivo</TabsTrigger>
                  <TabsTrigger value="result">Resultado</TabsTrigger>
                </TabsList>
                <TabsContent value="sheet">
                  <ScrollArea className="h-[80vh] w-full rounded-md border">
                    <Spreadsheet
                      hideRowIndicators={true}
                      data={excel}
                      hideColumnIndicators={true}
                    />
                  </ScrollArea>
                </TabsContent>
                <TabsContent value="result">
                  <div className="relative">
                    <ScrollArea className="h-[80vh] w-full rounded-md border">
                      <pre>{result}</pre>
                    </ScrollArea>
                    <div
                      className={`${
                        !result || result.length === 0 ? "hidden" : "block"
                      } absolute flex items-center justify-center top-2 right-2 z-40 p-2 rounded-full bg-gray-300 bg-blend-lighten text-gray-800 hover:bg-gray-100 hover:bg-opacity-50`}
                      onClick={() => {
                        if (result && result.length > 0) {
                          navigator.clipboard.writeText(result!);
                          toast({
                            title: "Copiado!",
                            type: "foreground",
                          });
                        }
                      }}
                    >
                      <button>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke-width="1.5"
                          stroke="currentColor"
                          className="w-6 h-6"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
        <div className="w-full sm:w-1/2">
          <div className="container">
            <h2 className="sm:text-xl text-sm my-2">
              Como você deseja processar esse arquivo?
            </h2>
            <Form {...form}>
              <FormField
                control={form.control}
                name="begin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Início</FormLabel>
                    <FormControl>
                      <Input placeholder="Sumula nº 1 do TST" {...field} />
                    </FormControl>
                    <FormDescription>Marcador início do texto.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="end"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Final</FormLabel>
                    <FormControl>
                      <Input placeholder="Precedentes: " {...field} />
                    </FormControl>
                    <FormDescription>Marcador final do texto</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="firstReg"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Regex Identificador Primário</FormLabel>
                    <FormControl>
                      <Input placeholder="[a-zA-Z]/g" {...field} />
                    </FormControl>
                    <FormDescription>
                      Regex para identificar o primeiro tópico do texto.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="secondReg"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Regex Delimitador Primário</FormLabel>
                    <FormControl>
                      <Input placeholder="[0-9]/g" {...field} />
                    </FormControl>
                    <FormDescription>
                      Regex para identificar o fim do tópico do texto.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="splitter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Splitter</FormLabel>
                    <FormControl>
                      <Input placeholder="/([IVXMCL]+){1})+ /g" {...field} />
                    </FormControl>
                    <FormDescription>
                      Regex para identificar cada seção do texto.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <button
                onClick={() => proc()}
                className="bg-gradient-to-r hover:to-slate-700 hover:from-zinc-600 from-slate-700 to-zinc-600 shadow-md text-slate-200 hover:text-slate-50 p-2 rounded my-5 flex justify-center items-center gap-2 sm:w-44 w-full transition-all duration-300 ease-linear"
              >
                Processar
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 0 1-2.448-2.448 14.9 14.9 0 0 1 .06-.312m-2.24 2.39a4.493 4.493 0 0 0-1.757 4.306 4.493 4.493 0 0 0 4.306-1.758M16.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"
                  />
                </svg>
              </button>
            </Form>
          </div>
        </div>
      </div>
    </main>
  );
}
