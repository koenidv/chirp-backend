export type MailParticipant = {
    email: string;
    name: string;
};

export type MailProps = {
    from: MailParticipant;
    to: MailParticipant[];
    subject: string;
    personalization: {
        // deno-lint-ignore no-explicit-any
        data: any
    }[];
    template_id: string;
};
