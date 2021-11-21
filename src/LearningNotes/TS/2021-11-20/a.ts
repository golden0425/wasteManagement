type EventConfig<Events extends { kind: string }> = {
  [E in Events as  E['kind']]: (event: E) => void;
}

type SquareEvent = { kind: "square", x: number, y: number };
type CircleEvent = { kind: "circle", radius: number };
type ReactEvent = { radius: number };

type Config = EventConfig<SquareEvent | CircleEvent>
