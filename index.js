import { getContent, getQa } from './online-abc.js';
import fs from 'fs';
const proxy = fs.readFileSync('./proxy.txt', 'utf-8').split('\n').filter((line) => line.length > 0);

const choice = (arr) => {
    const randomIndex = Math.floor(Math.random() * arr.length);
    return arr[randomIndex];
}

let qnaRes = {};
let _proxy = choice(proxy).split(':');

let page = 90; // 시작 페이지
while(true) {
    let qnaList;
    try {
        qnaList = await getQa(page, {ip: _proxy[0], port: _proxy[1]});
    } catch {
        _proxy = choice(proxy).split(':'); // proxy 새로 선택
        console.log(`${page} page의 Q&A list를 불러오지 못했습니다. 다시 시도합니다.`);
        continue;
    }
    console.log(`${page} page의 Q&A list를 불러왔습니다.`)

    if(qnaList.length == 0) {
        console.log(qnaList)
        break;
    }

    for(let qna of qnaList) {
        while(true) {
            console.log(`Q&A ${qna['id']}|"${qna['title']}"의 내용을 불러옵니다.`);
            
            let content;
            try {
                _proxy = choice(proxy).split(':'); // proxy 새로 선택
                content = await getContent(qna['id'], {ip: _proxy[0], port: _proxy[1]});
            } catch {
                console.log(`Q&A ${qna['id']}의 내용을 불러오지 못했습니다. 다시 시도합니다.`);
                continue;
            }

            if(Object.keys(content['answer']).length == 0) {
                console.log(` ㄴQ&A ${qna['id']}|"${qna['title']}" 질문에 대한 답변이 없습니다`);
                break; // 답변이 없는 경우 저장하지 않음
            }

            qnaRes[qna['id']] = content;
            break;
        }
    }

    fs.writeFileSync('./qna.json', JSON.stringify(qnaRes), 'utf-8');
    console.log('')
    page++;
}

console.log("모든 Q&A를 가져왔거나, 문제가 생겨 중단되었습니다");