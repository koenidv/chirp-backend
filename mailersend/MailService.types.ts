export type MailParticipant = {
    email: string;
    name: string;
};

export type MailProps = {
    subject: string;
    personalization: {
        // deno-lint-ignore no-explicit-any
        data: any
    }[];
    template_id: string;
};

export type Mail = MailProps & {
    from: MailParticipant;
    to: MailParticipant[];
};
