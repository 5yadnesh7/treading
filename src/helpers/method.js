export const filterByStrikePrice = (array, inputValue, n) => {
    const index = array.reduce((closestIndex, item, currentIndex) => {
        const currentDiff = Math.abs(item.label - inputValue);
        const closestDiff = Math.abs(array[closestIndex].label - inputValue);
        return currentDiff < closestDiff ? currentIndex : closestIndex;
    }, 0);

    const lowerBound = Math.max(0, index - n);
    const upperBound = Math.min(array.length, index + n + 1);

    const selectedElements = array.slice(lowerBound, upperBound);

    return selectedElements.reduce((result, item) => {
        result.push({ label: item.label, y: item.y });
        return result;
    }, []);
}
