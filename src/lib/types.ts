export interface ExcuseRecord {
  id: string;
  target: string;
  scenario: string;
  tone: string;
  excuse: string;
  signOff: string;
  dateIssued: string;
  createdAt: string;
}

export interface GenerateExcusePayload {
  target: string;
  scenario: string;
  tone: string;
}
