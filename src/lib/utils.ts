export interface TransactionResult {
    id: string;
    name: string;
    message: string;
    amount: string;
    timestamp: string;
}

// donor interface
export interface Donor {
    id: number;
    name: string;
    message: string;
    amount: number;
    timestamp: number;
}

export const mapResultsFromTx = (results: TransactionResult[]): Donor[] => {
    return results
        // .filter(
        //     tx =>
        //         tx.tx_type === 'contract_call' && tx.contract_call.function_name === 'buy-coffee'
        // )
        .map((donor, index) => {
            return {
                id: Number(donor.id),
                name: donor.name,
                message: donor.message,
                amount: Number(donor.amount),
                timestamp: Number(donor.timestamp)
            };
        }).reverse();
}

export const getError = (error: any): [number, string] => {
    const _code = error?.data?.code ?? error?.code ?? 0;
    const _error = error?.data?.message ?? error?.message ?? "";
    // keep all string after the first "##"
    const _message = _error?.split("##")[1];
    return [_code, _message];
}