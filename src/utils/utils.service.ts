import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { v4 as uuidV4 } from 'uuid';
import * as nodemailer from 'nodemailer';
import { User } from 'src/user/user.entity';
import { EmailOptionsDto } from './utils.schema';
import { config } from 'src/constants';

@Injectable()
export class UtilsService {
  private redis: Redis;
  private transporter: any;

  constructor() {
    this.redis = new Redis();
    this.transporter = nodemailer.createTransport({
      host: config.NODE_MAILER.HOST,
      port: config.NODE_MAILER.PORT,
      secure: config.NODE_MAILER.SECURE, // true for 465, false for other ports
      auth: {
        user: config.NODE_MAILER.USERNAME, // generated ethereal user
        pass: config.NODE_MAILER.PASSWORD, // generated ethereal password
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  private async generateLinkId(): Promise<string> {
    let linkId: string = uuidV4();
    let isDuplicated: string = await this.redis.get(linkId);
    while (!!isDuplicated) {
      linkId = uuidV4();
      isDuplicated = await this.redis.get(linkId);
    }
    return linkId;
  }

  async createRecoveryEmailLink(user: User): Promise<string> {
    const linkId: string = await this.generateLinkId();
    // expire in 5 minutes
    await this.redis.set(linkId, user.id, 'EX', 60 * 5);
    return linkId;
  }

  async getIdByRCode(rcode: string): Promise<string> {
    return this.redis.get(rcode);
  }

  async deleteRcode(rcode: string): Promise<void> {
    this.redis.del(rcode);
  }

  async sendEmail(emailOptions: EmailOptionsDto): Promise<void> {
    await this.transporter.sendMail(emailOptions);
  }

  private emailTemplate(link: string, username: string): string {
    return `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
        />
        <style>
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: Roboto, Arial, Helvetica, sans-serif;
          }
          .card {
            background-color: #ffffff;
            padding: 30px;
            border: 1px solid #ffffff;
            border-radius: 5px;
            width: 500px;
          }
          p {
            margin: 10px 0px;
          }
          .title {
            margin: 10px 0px 30px 0px;
          }
          .footer {
            border-top: 1px solid #02333e;
            padding-top: 20px;
            margin: 30px 0px 10px 0px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="card">
            <h2 class="title">Hello ${username}</h2>
            <p>You can reset your password with this link:</p>
            <p>
              <a href="${link}"
                >${link}</a
              >
            </p>
            <p class="footer">${config.NODE_MAILER.WEBSITE}</p>
            <p>${config.NODE_MAILER.USERNAME}</p>
          </div>
        </div>
      </body>
    </html>
    `;
  }

  generateRecoveryEmailTemplate(link: string, username: string): string {
    return this.emailTemplate(link, username);
  }
}
