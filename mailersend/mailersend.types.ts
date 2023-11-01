export type MailParticipant = {
    email: string;
    name: string;
};

export type MailPersonalization = {
    email: string;
    data: any;
};

export type Mail = {
    from: MailParticipant;
    to: MailParticipant[];
    subject: string;
    personalization: MailPersonalization[];
    template_id: string;
};