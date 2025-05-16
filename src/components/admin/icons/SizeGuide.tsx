
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface IconSize {
  name: string;
  width: number;
  height: number;
  description: string;
}

interface SizeGuideProps {
  recommendedSizes: IconSize[];
}

export const SizeGuide = ({ recommendedSizes }: SizeGuideProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Guia de Tamanhos de Ícones</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4">
          É importante utilizar os tamanhos corretos de ícones para garantir que seu site seja exibido adequadamente
          em diferentes dispositivos e plataformas. Abaixo estão listados os tamanhos recomendados.
        </p>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome do Arquivo</TableHead>
                <TableHead>Tamanho</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Uso</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">favicon.ico</TableCell>
                <TableCell>32x32 pixels</TableCell>
                <TableCell>Ícone padrão do site</TableCell>
                <TableCell className="font-mono text-sm">
                  {'<link rel="icon" href="/icons/favicon.ico">'}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">apple-touch-icon.png</TableCell>
                <TableCell>180x180 pixels</TableCell>
                <TableCell>Ícone para iOS Safari</TableCell>
                <TableCell className="font-mono text-sm">
                  {'<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">'}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">android-chrome-192x192.png</TableCell>
                <TableCell>192x192 pixels</TableCell>
                <TableCell>Ícone para Android Chrome</TableCell>
                <TableCell className="font-mono text-sm">
                  {'<link rel="icon" type="image/png" sizes="192x192" href="/icons/android-chrome-192x192.png">'}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">android-chrome-512x512.png</TableCell>
                <TableCell>512x512 pixels</TableCell>
                <TableCell>Ícone para Android Chrome (grande)</TableCell>
                <TableCell className="font-mono text-sm">
                  {'<link rel="icon" type="image/png" sizes="512x512" href="/icons/android-chrome-512x512.png">'}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">mstile-144x144.png</TableCell>
                <TableCell>144x144 pixels</TableCell>
                <TableCell>Ícone para Windows</TableCell>
                <TableCell className="font-mono text-sm">
                  {'<meta name="msapplication-TileImage" content="/icons/mstile-144x144.png">'}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">safari-pinned-tab.svg</TableCell>
                <TableCell>SVG (qualquer tamanho)</TableCell>
                <TableCell>Ícone SVG para Safari</TableCell>
                <TableCell className="font-mono text-sm">
                  {'<link rel="mask-icon" href="/icons/safari-pinned-tab.svg" color="#5bbad5">'}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">Melhores práticas:</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Use formatos PNG para a maioria dos ícones</li>
            <li>O arquivo favicon.ico deve ser no formato ICO</li>
            <li>Mantenha o tamanho dos arquivos pequeno para carregamento rápido</li>
            <li>Utilize SVG para o safari-pinned-tab para melhor qualidade</li>
            <li>Mantenha cores consistentes com sua marca</li>
          </ul>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">Implementação no HTML:</h3>
          <div className="bg-slate-50 p-4 rounded-md overflow-x-auto">
            <pre className="text-sm">
{`<link rel="icon" href="/icons/favicon.ico">
<link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png">
<link rel="icon" type="image/png" sizes="192x192" href="/icons/android-chrome-192x192.png">
<link rel="icon" type="image/png" sizes="512x512" href="/icons/android-chrome-512x512.png">
<link rel="mask-icon" href="/icons/safari-pinned-tab.svg" color="#5bbad5">
<meta name="msapplication-TileImage" content="/icons/mstile-144x144.png">
<meta name="msapplication-TileColor" content="#da532c">`}
            </pre>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
