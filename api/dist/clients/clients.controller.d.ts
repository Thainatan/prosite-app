export declare class ClientsController {
    findAll(): Promise<{
        id: string;
        firstName: string;
        lastName: string;
        email: string | null;
        phone: string;
        address: string;
        city: string;
        state: string;
        zip: string;
        notes: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[] | {
        error: any;
    }>;
    create(body: any): Promise<{
        id: string;
        firstName: string;
        lastName: string;
        email: string | null;
        phone: string;
        address: string;
        city: string;
        state: string;
        zip: string;
        notes: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    } | {
        error: any;
    }>;
}
