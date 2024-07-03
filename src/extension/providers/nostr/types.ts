export type Event = {
  id?: string;
  kind: EventKind;
  pubkey?: string;
  content: string;
  tags: string[][];
  created_at: number;
  sig?: string;
};

export enum EventKind {
  Metadata = 0,
  Text = 1,
  RelayRec = 2,
  Contacts = 3,
  DM = 4,
  Deleted = 5,
  Repost = 6,
  React = 7,
  AwardBadge = 8,
  CreateChannel = 40,
  UpdateChannel = 41,
  SendChannelMessage = 42,
  HideChannelMessage = 43,
  MuteChannelUser = 44,
  ReportNote = 1984,
  ZapRequest = 9734,
  ZapReceipt = 9735,
  MuteList = 10000,
  RelayList = 10002,
  Bookmarks = 10003,
  Authenticate = 22242,
  RemoteSign = 24133,
  HTTPAuth = 27235,
  ProfileBadge = 30008,
  CreateBadge = 30009,
  LongNote = 30023,
  AppData = 30078,
  UploadChunk = 10000135,
}
