const perehids = [[0,7,3],[1,null,2],[3,1,3],[3,7,2],[4,1,2],[6,5,1],
    [7,null,3],[7,1,1],[8,0,1],[8,2,2],[8,3,2],[8,4,3],[8,5,2],[8,6,1],[8,9,1],
    [9,3,1],[9,5,1],[9,4,2],[9,7,2],['+','-',1]];

function change(numb, n, pos){
    let m = [];
    let a = [];
    let b = false;
   for(let i = 0; i<20; i++){
       a = perehids[i];
       if(numb == a[pos]&&(a[2]<=n)) {m.push([a[(pos+1)%2], a[2]]); b=true}
   }
   if(b==false) m =[0]
    return m;
}

function changes(numbers, n, pos){
    let m = [];
    for(let k=0;k<numbers.length;k++){
        m.push(change(numbers[k],n,pos));
    }
    return m;
}

function list_in_eq(l){
    let m = [];
    let count = 0;
    for(let j=0;j<l.length;j++){
        if(op(l[j])) {
            if(j+1==l.length||op(l[j+1])){
                m=['f'];
                break;
            }
            m.push( l[j]);
            count = 0;
        }else{
            if(l[j]==0&&count==0&&j+1<l.length&&!op(l[j+1])) {
                m=['f'];
                break;}else{}
            if(l[j]==null){

            }else{
                if(count>0){
                count+=1;
                m[m.length-1]=m[m.length-1]*10+l[j];
                }
            else{count++;
                m.push(l[j]);}
            }
            }
        }
    return m;
    }


function op(s) {
    return s=='+'||s=='-'||s=='=';
}

function comb(l,p) {
    let res = [[]];
    let c = []
    for(let i = 0;i<l.length;i++){
        if(l[i]==0){
            for(let j = 0; j<res.length;j++){
                res[j].push(0);
            }
        }else{
            c = l[i];
            len = res.length;

            for(let j = 0; j<len;j++) {
                res.push(res[j].concat([0]));
            }
            for(let j = 0; j<len;j++) {
                for (let k = 0; k < c.length; k++) {
                    res.push(res[j].concat([c[k]]));
                }
            }
            res = res.filter((l)=>l.length>i);
        }
    }
    return res;
}

function clearP(l, p){
    let res = l.filter((j)=>(p==summ(j)))
    return res;
}

function summ(l){
    let sum = 0;
    for(let i = 0; i<l.length;i++){
        if(!l[i]==0) {
            sum += l[i][1];
        }
    }
    return sum;
}

function move_list(l,m){
    let res = [];
    for (let i = 0;i<l.length;i++){
        if(m[i]==0)res.push(l[i]); else res.push(m[i][0])
    }
    return res;
}

function arifm(l){
    let f = list_in_eq(l);
    let count = 0;
    let s = f[0];
    if(s=='f') return false;
    for(let i = 1; i< f.length;i++){
        count = i%2;

        if(count == 1){
            if(f[i]=='='){if(f[i+1]==s) {return true; }else return false;}
            if(f[i]=='+') s=s+f[i+1];
            if(f[i]=='-') s=s-f[i+1];
        }
    }
}
function solution(l,p){
    let res = [];
    let f = clearP(comb(changes(l, p, 0)),p);
    let d = [];
    for (let i = 0;i<f.length; i++){
        d=move_list(l,f[i]);
        if(arifm(d)==true){res.push(d)}
    }
    return res;
}
function generator(l,p){
    let res = [];
    let f = clearP(comb(changes(l, p, 1)),p);
    let d = [];
    for (let i = 0;i<f.length; i++){
        d=list_in_eq(move_list(l,f[i]));
        if(!(d[0]=='f')){res.push(d)}
    }
    return res;
}
function game(l,p){
    let s = solution(l,p);
    for (let i = 0; i<s.length; i++){
        console.log(list_in_eq(s[i]));
        console.log(generator(s[i],p));
    }
}

game([8,4,'+',2,'=',8,3],2);