export type EventFragment = {
  kind: EventKind;
  pubkey?: string;
  content: string;
  tags: string[][];
  created_at: number;
};

export type Event = EventFragment & {
  id?: string;
  sig?: string;
};

export enum EventKind {
  Metadata = 0,
  Text = 1,
  RelayRec = 2,
  Contacts = 3,
  DM = 4,
  Deleted = 5,
}
