import axios from 'axios';
import * as cheerio from 'cheerio';

export const getQa = async (page, {ip, port}) => {
    const res = await axios.get(`https://korean.go.kr/front/onlineQna/onlineQnaList.do?mn_id=216&pageIndex=${page}`, {
        // proxy: {
        //     protocol: 'http',
        //     host: ip,
        //     port: port,
        // },
    });

    const $ = cheerio.load(res.data);

    const row = $("#content > div.table > table > tbody > tr").toArray();
    
    let qa = [];
    for(let tr of row) {
        const id = $(tr).find('td:nth-child(1)').text();
        const title = $(tr).find('td.alignL.subject > a').text();
        const url = $(tr).find('td.alignL.subject > a').attr('href');
        const type = $(tr).find('td.alignL.subject > a').attr('class')

        if(id == "검색된 자료가 없습니다. 다른 검색조건을 선택해주세요." && !url) break;
        else if(['reply', 'notice'].includes(type)) continue;

        qa.push({
            id: id,
            title: title,
        });
    }

    return qa;
}

export const getContent = async (id, {ip, port}) => {
    const res = await axios.get(`https://korean.go.kr/front/onlineQna/onlineQnaView.do?mn_id=216&qna_seq=${id}`, {
        // proxy: {
        //     protocol: 'http',
        //     host: ip,
        //     port: port,
        // },
    });

    const $ = cheerio.load(res.data);
    
    let qna = { question: {}, answer: {} };
    
    // question
    qna['question']['title'] = $("#content > div.boardView > div:nth-child(1) > h2").text();
    qna['question']['content'] = (($("#content > div.boardView > div:nth-child(2) > p").toArray()).map((p) => {
        return $(p).text();
    })).join('\n');

    // answer
    if($("#content > div.boardView > div:nth-child(3) > h2").text() != "") {
        qna['answer']['title'] = $("#content > div.boardView > div:nth-child(3) > h2").text();
        qna['answer']['content'] = (($("#content > div.boardView > div:nth-child(4) > p").toArray()).map((p) => {
            return $(p).text();
        })).join('\n');
    }

    return qna;
}

// const rmSCsymbol = (str) => {
//     str = str.replace(/&nbsp;/g, ' ');
//     str = str.replace(/&lt;/g, '<');
//     str = str.replace(/&gt;/g, '>');
//     str = str.replace(/&amp;/g, '&');
//     str = str.replace(/&quot;/g, '"');
//     str = str.replace(/&#035;/g, '#');
//     str = str.replace(/&#039;/g, '\'');

//     return str;
// }