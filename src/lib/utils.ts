
export const truncateUrl = (url: string) => {
    if (url.length > 6) {
        return url.slice(0, 4) + '...' + url.slice(-3);
    }
    return url;
};

export const mapResultsFromTx = results =>
    results
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


export const getError = (error: any) => {
    const _code = error?.data?.code;
    const _error = error?.data?.message;
    // keep all string after the first "##"
    const _message = _error?.split("##")[1];
    return [_code, _message];
}