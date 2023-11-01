import db from "./db.ts";

export enum SecurityAction {
    REGISTER = "register",
    LOGIN = "login",
    CHANGE_PASSWORD = "change_password",
    REQUEST_PASSWORD_RESET = "request_password_reset",
    CHANGE_USERNAME = "change_username",
    CHANGE_EMAIL = "change_email",
    CLOSE_SESSION = "close_session",
    CLOSE_ALL_SESSIONS = "close_all_sessions",
}

export class SecurityLog {

    static async insertLog(action: SecurityAction, auth_id: bigint | undefined, session_id: string | undefined, ip: string) {
        await db(async (client) => {
            await client.queryArray`
                INSERT INTO security_log (action, auth_id, session_id, ip)
                VALUES (${action}, ${auth_id}, ${session_id}, ${ip})
            `;
        });
    }

}