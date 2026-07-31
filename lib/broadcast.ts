// Store for SSE connections
const connections = new Map<string, Set<ReadableStreamDefaultController>>();

export function addConnection(pollId: string, controller: ReadableStreamDefaultController) {
  if (!connections.has(pollId)) {
    connections.set(pollId, new Set());
  }
  connections.get(pollId)!.add(controller);
}

export function removeConnection(pollId: string, controller: ReadableStreamDefaultController) {
  connections.get(pollId)?.delete(controller);
  if (connections.get(pollId)?.size === 0) {
    connections.delete(pollId);
  }
}

export async function broadcastPollUpdate(pollId: string, getResults: () => Promise<any> | any) {
  try {
    const results = await getResults();
    if (!results) return;

    const data = JSON.stringify(results);
    const controllers = connections.get(pollId);
    if (controllers) {
      controllers.forEach(controller => {
        try {
          controller.enqueue(`data: ${data}\n\n`);
        } catch (error) {
          // Connection closed, remove it
          controllers.delete(controller);
        }
      });
    }
  } catch (err) {
    console.error('Broadcast error:', err);
  }
}
