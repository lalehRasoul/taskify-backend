import { config } from 'src/constants';

export class EmailOptionsDto {
  from: string;
  to: string;
  subject: string;
  text?: string;
  html?: string;

  constructor() {
    this.from = config.NODE_MAILER.FROM;
    this.subject = config.NODE_MAILER.SUBJECT;
  }
}
