declare module 'qrcode-terminal' {
    function generate(
        input: string,
        opts?: { small?: boolean }
    ): void;

    export = { generate };
}
