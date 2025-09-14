import moment from "moment";

export const addThousandSeparator = (value) => {
    if (!value) return '0';
    const [integerPart, decimalPart] = value.toString().split('.');
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;
}

export const preparedExpenseBarChartData = (transactions) => { 
    const chartData = transactions.map((item) => {
        return {
            category: item?.category,
            amount: item?.amount
        };
    });
    return chartData;
}


export const preparedIcomeBarChartData = (transactions) => {
    const sortedTransactions = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));
    const chartData = sortedTransactions.map((item) => ({
        month: moment(item.date).format('MMM YYYY'),
        category: item.source || 'Unknown',
        amount: Number(item.amount) || 0,
    }));
    return chartData;
}

export const prepareExpenseLineChartData = (transactions) => {
    const sortedTransactions = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));
    const chartData = sortedTransactions.map((item) => ({
        month: moment(item.date).format('DD MMM YYYY'),
        amount: Number(item.amount) || 0,
        category: item?.category || 'Unknown',
    }));
    return chartData;
}