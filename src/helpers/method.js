export const filterByStrikePriceOld = (inputArray, targetStrikePrice, length) => {
    const sortedArray = inputArray.sort((a, b) => a.label - b.label);

    const targetIndex = sortedArray.findIndex(item => item.label > targetStrikePrice && targetStrikePrice > item.label - 50);

    const aboveTarget = sortedArray.slice(targetIndex + 1, targetIndex + 1 + length);

    const belowTarget = sortedArray.slice(targetIndex - length, targetIndex);

    const outputArray = belowTarget.concat(aboveTarget);
    return outputArray;
}


export const filterByStrikePrice = (array, inputValue, n) => {
    // Find the index of the object with the closest "label" value to the entered value
    const index = array.reduce((closestIndex, item, currentIndex) => {
        const currentDiff = Math.abs(item.label - inputValue);
        const closestDiff = Math.abs(array[closestIndex].label - inputValue);
        return currentDiff < closestDiff ? currentIndex : closestIndex;
    }, 0);

    // Calculate the lower and upper bounds for the slice
    const lowerBound = Math.max(0, index - n);
    const upperBound = Math.min(array.length, index + n + 1);

    // Use slice to get the selected elements
    const selectedElements = array.slice(lowerBound, upperBound);

    // Return the result
    return selectedElements.reduce((result, item) => {
        result.push({ label: item.label, y: item.y });
        return result;
    }, []);
}
