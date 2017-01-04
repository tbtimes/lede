export interface GoogleUser {
    kind: string;
    displayName: string;
    isAuthenticatedUser: boolean;
    permissionId: string;
    emailAddress: string;
    picture?: {
        url: string;
    };
}
export interface GoogleRestAPI {
    kind: string;
    id: string;
    etag: string;
    selfLink: string;
    alternateLink: string;
    embedLink: string;
    iconLink: string;
    thumbnailLink: string;
    title: string;
    mimeType: string;
    labels: {
        starred: boolean;
        hidden: boolean;
        trashed: boolean;
        restricted: boolean;
        viewed: boolean;
    };
    createDate: string;
    modifiedDate: string;
    parents: any[];
    exportLinks: {
        "application/rtf": string;
        "application/vnd.oasis.opendocument.text": string;
        "text/html": string;
        "application/pdf": string;
        "application/zip": string;
        "application/vnd.openxmlformats-officedocument.wordpressingml.document": string;
        "text/plain": string;
    };
    userPermission: {
        kind: string;
        etag: string;
        id: string;
        selfLink: string;
        role: string;
        type: string;
    };
    ownerNames: string[];
    owners: GoogleUser[];
    lastModifyingUser: GoogleUser;
    editable: boolean;
    copyable: boolean;
    writersCanShare: boolean;
    shared: boolean;
    explicitlyTrashed: boolean;
    appDataContents: boolean;
    spaces: string[];
}
