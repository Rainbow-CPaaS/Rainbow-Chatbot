function getHashTags(inputText) {  
    const regex = /(^|\B)#(?![0-9_-]+\b)([a-zA-Z0-9_-]{1,30})(\b|\r)/g;
    var matches = [];
    var match;

    while ((match = regex.exec(inputText))) {
        matches.push(match[2]);
    }

    return matches;
}

module.exports = getHashTags; 