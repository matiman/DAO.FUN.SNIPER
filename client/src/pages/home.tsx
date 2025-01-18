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

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <Card className="p-6">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Terminal className="h-5 w-5" />
              <h1 className="text-xl font-bold">Webhook Listener</h1>
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
                <h2 className="text-sm font-semibold">Public UI URL</h2>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={() => copyUrl(publicUrl, 'ui')}
                >
                  <Copy className="h-4 w-4" />
                  Copy URL
                </Button>
              </div>
              <div className="bg-muted p-3 rounded-md font-mono text-sm">
                {publicUrl}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Share this URL with your team to view incoming webhook events in real-time.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-semibold">Webhook Endpoint</h2>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={() => copyUrl(webhookUrl, 'webhook')}
                >
                  <Copy className="h-4 w-4" />
                  Copy URL
                </Button>
              </div>
              <div className="bg-muted p-3 rounded-md font-mono text-sm">
                {webhookUrl}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Send POST requests to this endpoint to log webhook events.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Webhook Logs</h2>
          <ScrollArea className="h-[500px] w-full rounded-md border p-4">
            <div className="font-mono text-sm space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className="space-y-2">
                  <div className="text-muted-foreground">
                    {msg.payload.timestamp} - {msg.payload.method} Request
                  </div>
                  <div className="bg-muted p-3 rounded-md overflow-x-auto">
                    <pre>{JSON.stringify(msg.payload.body, null, 2)}</pre>
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