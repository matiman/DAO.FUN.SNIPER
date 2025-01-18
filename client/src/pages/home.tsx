import { useWebSocket } from '@/lib/websocket';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Copy, Terminal, Wifi, WifiOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const { messages, connected } = useWebSocket();
  const { toast } = useToast();
  const webhookUrl = `${window.location.protocol}//${window.location.host}/api/webhook`;
  const publicUrl = `${window.location.protocol}//${window.location.host}`;

  const copyUrl = async (url: string, type: 'webhook' | 'ui') => {
    await navigator.clipboard.writeText(url);
    toast({
      title: "Copied!",
      description: `${type === 'webhook' ? 'Webhook' : 'Public UI'} URL copied to clipboard`
    });
  };

  // Function to get background color based on index
  const getBackgroundColor = (index: number) => {
    const colors = [
      'bg-green-50 dark:bg-green-950/30',
      'bg-black/5 dark:bg-black/30'
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <Card className="p-6">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Terminal className="h-5 w-5" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Webhook Listener</h1>
              {connected ? (
                <div className="flex items-center gap-1 text-sm text-green-500">
                  <Wifi className="h-4 w-4" />
                  <span>Connected</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-sm text-red-500">
                  <WifiOff className="h-4 w-4" />
                  <span>Disconnected</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Public UI URL</h2>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={() => copyUrl(publicUrl, 'ui')}
                >
                  <Copy className="h-4 w-4" />
                  <span className="text-gray-900 dark:text-gray-100">Copy URL</span>
                </Button>
              </div>
              <div className="bg-muted p-3 rounded-md font-mono text-sm text-gray-900 dark:text-gray-100">
                {publicUrl}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Share this URL with your team to view incoming webhook events in real-time.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Webhook Endpoint</h2>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={() => copyUrl(webhookUrl, 'webhook')}
                >
                  <Copy className="h-4 w-4" />
                  <span className="text-gray-900 dark:text-gray-100">Copy URL</span>
                </Button>
              </div>
              <div className="bg-muted p-3 rounded-md font-mono text-sm text-gray-900 dark:text-gray-100">
                {webhookUrl}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Send POST requests to this endpoint to log webhook events.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Webhook Logs</h2>
          <ScrollArea className="h-[500px] w-full rounded-md border">
            <div className="font-mono text-sm divide-y">
              {messages.map((msg, i) => (
                <div key={msg.payload.id} className={`p-6 ${getBackgroundColor(i)}`}>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        {new Date(msg.payload.timestamp).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </div>
                      <div className="text-xs px-2 py-1 rounded bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 font-mono">
                        ID: {msg.payload.id.slice(0, 8)}
                      </div>
                    </div>
                    <div className="pl-4 border-l-2 border-green-200 dark:border-green-800 space-y-3">
                      <div className="text-sm font-semibold text-green-700 dark:text-green-300">
                        {msg.payload.method} Request
                      </div>
                      <div className="bg-white dark:bg-black/20 p-4 rounded-md overflow-x-auto">
                        <pre className="text-xs text-gray-900 dark:text-gray-100">{JSON.stringify(msg.payload.body, null, 4)}</pre>
                      </div>
                      <details className="text-xs">
                        <summary className="cursor-pointer text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200">
                          Headers
                        </summary>
                        <div className="mt-2 bg-white dark:bg-black/20 p-4 rounded-md overflow-x-auto">
                          <pre className="text-gray-900 dark:text-gray-100">{JSON.stringify(msg.payload.headers, null, 4)}</pre>
                        </div>
                      </details>
                    </div>
                  </div>
                </div>
              ))}
              {messages.length === 0 && (
                <div className="text-muted-foreground text-center py-8">
                  Waiting for webhook events...
                </div>
              )}
            </div>
          </ScrollArea>
        </Card>
      </div>
    </div>
  );
}