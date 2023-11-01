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

    static async getLogsForUser(user_id: bigint) {
        const userid = BigInt(user_id);
        return await db(async (client) => (
            await client.queryObject<
                {
                    action: SecurityAction;
                    auth_id: bigint;
                    session_active: boolean;
                    ip: string;
                    timestamp: Date;
                }
            >`
            SELECT
                s.action as action,
                s.auth_id as auth_id,
                CASE
                    WHEN sessions.session_id IS NOT NULL THEN true
                    ELSE false
                END AS session_active,
                s.session_id as session_id,
                s.ip as ip,
                s.timestamp as timestamp
            FROM users
                JOIN auths on users.user_id = auths.user_id
                JOIN security_log s on auths.auth_id = s.auth_id
                LEFT JOIN sessions on s.session_id = sessions.session_id
            WHERE users.user_id = ${userid}
            ORDER BY id DESC
            `
        ).rows);
    }

}