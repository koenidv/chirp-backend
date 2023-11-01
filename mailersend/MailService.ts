import { Mail, MailProps } from "./MailService.types.ts";

const DEFAULT_BASE_URL = "https://api.mailersend.com/v1/email"

export class MailService {
    username: string;
    useremail: string;
    base_url: string;

    constructor(username: string, email: string, base_url: string = DEFAULT_BASE_URL) {
        this.useremail = email;
        this.username = username;
        this.base_url = base_url;
    }

    sendPasswordReset(
        token: string,
    ): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.send({
                subject: "Reset your password for Chirp",
                personalization: [{
                    data: {
                        name: this.username,
                        token: token,
                    },
                }],
                template_id: "neqvygmn6r540p7w",
            }).then(() => {
                resolve(true);
            }).catch((err) => {
                console.error("Error sending password reset email for user", this.username);
                console.error(err);
                reject(false);
            })
        });
    }

    private send(mail: MailProps): Promise<void> {
        return new Promise((resolve, reject) => {
            fetch(this.base_url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${Deno.env.get("MAILERSEND_KEY")}`,
                },
                body: JSON.stringify({
                    from: {
                        email: "florian@koeni.dev",
                        name: "Chirp Account",
                    },
                    to: [{
                        email: this.useremail,
                        name: this.username,
                    }],
                    ...mail
                } as Mail),
            }).then((result) => {
                if (result.status === 200) resolve();
                else reject(result.statusText);
            });
        });
    }

}
