export interface SseJsonEvent<T> {
  data: T;
  rawData: string;
}

export function parseSseJsonEvents<T>(body: string): SseJsonEvent<T>[] {
  const events: SseJsonEvent<T>[] = [];
  const frames = body.split(/\r?\n\r?\n/);

  for (const [index, frame] of frames.entries()) {
    const dataLines = frame
      .split(/\r?\n/)
      .filter((line) => line.startsWith("data:"))
      .map((line) => {
        const value = line.slice(5);
        return value.startsWith(" ") ? value.slice(1) : value;
      });

    if (dataLines.length === 0) {
      continue;
    }

    const rawData = dataLines.join("\n");
    try {
      events.push({ data: JSON.parse(rawData) as T, rawData });
    } catch {
      throw new Error(`Invalid SSE JSON in frame ${index + 1}`);
    }
  }

  return events;
}
