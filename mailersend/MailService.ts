import { Mail } from "./mailersend.types.ts";

const MAILERSEND_BASE_URL = "https://api.mailersend.com/v1/email"

export class MailService {

    static sendPasswordReset(
        email: string,
        username: string,
        token: string,
    ): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.send({
                from: {
                    email: "florian@koeni.dev",
                    name: "Chirp Account",
                },
                to: [{
                    email: email,
                    name: username,
                }],
                subject: "Reset your password for Chirp",
                personalization: [{
                    email: email,
                    data: {
                        name: username,
                        token: token,
                    },
                }],
                template_id: "neqvygmn6r540p7w",
            }).then(() => {
                resolve(true);
            }).catch((err) => {
                console.error("Error sending password reset email for user", username);
                console.error(err);
                reject(false);
            })
        });
    }


    private static send(mail: Mail): Promise<void> {
        return new Promise((resolve, reject) => {
            fetch(MAILERSEND_BASE_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${Deno.env.get("MAILERSEND_KEY")}`,
                },
                body: JSON.stringify(mail),
            }).then((result) => {
                if (result.status === 200) resolve();
                else reject(result.statusText);
            });
        });
    }

}
