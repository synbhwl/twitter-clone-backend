
function getRandomInt(): string{
    const nums: string = '1234567890'
    const randomIndex = Math.floor(Math.random() * nums.length);
    const randomElement = nums[randomIndex];

    return randomElement;
}

function getRandomString():string{
    const chars: string = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const randomIndex = Math.floor(Math.random() * chars.length);
    const randomElement = chars[randomIndex];

    return randomElement;
}

export function getRandomId(): string{
    let randomId: string = '';
    
    for(let i: number = 0; i < 36; i++){
        if(i === 8 || i === 13 || i === 18 || i === 23){
            randomId += '-'
        } else {
            const randomInt: string = getRandomInt();
            const randomChar: string = getRandomString();
            const choice: Array<string> = [randomInt, randomChar];
    
            const randomIndex = Math.floor(Math.random() * choice.length);
            const randomElement = choice[randomIndex];
            randomId += randomElement; 
        }
    }

    return randomId;
}