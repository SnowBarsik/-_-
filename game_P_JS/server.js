//server.js

const express = require('express');
const app = express();
const port = 3000;
const pl = require('tau-prolog');
require("tau-prolog/modules/lists")(pl);

app.use(express.static('public'));
app.use(express.json());

app.post('/solve', (req, res) => {
    const equation = req.body.equation;
    const matchesToRemove = req.body.matchesToRemove;
    const prologInput = convertEquationToPrologList(equation);
    const prologQuery = `game([${prologInput}], ${matchesToRemove}, Res, Gen).\n`;
    // const prologInput = convertEquationToPrologList(equation);

    // Створення сесії Tau Prolog
    let session = pl.create();
    // Програма Prolog
    let program = `
:- use_module(library(lists)).

perehid(0, 7, 3).
perehid(1, null, 2).
perehid(3, 1, 3).
perehid(3, 7, 2).
perehid(4, 1, 2).
perehid(6, 5, 1).
perehid(7, null, 3).
perehid(7, 1, 1).
perehid(8, 0, 1).
perehid(8, 2, 2).
perehid(8, 3, 2).
perehid(8, 4, 3).
perehid(8, 5, 2).
perehid(8, 6, 1).
perehid(8, 9, 1).
perehid(9, 3, 1).
perehid(9, 4, 2).
perehid(9, 5, 1).
perehid(9, 7, 3).
perehid(+, -, 1).

change(Numb, N, Res, X):-
    perehid(Numb, Res, X),
    N+1 > X.

changes([], _, []):-!.
changes([H|T], Price, [[[]|L]|Changes]):-
    findall([Res,X], change(H, Price, Res, X), L),
    changes(T, Price, Changes).

changes_backward([], _, []):-!.
changes_backward([H|T], Price, [[[]|L]|Changes]):-
    findall([Res,X], change(Res, Price, H, X), L),
    changes_backward(T, Price, Changes).


list_in_eq([0|[_|_]], 0, ['false']):-!.
list_in_eq([], 0, []):-!.
list_in_eq([H|T], Count, Res):-
    H == null,
    list_in_eq(T, Count, Res),!.
is_operator(H) :- H == '+'. 
is_operator(H) :- H == '-'. 
is_operator(H) :- H == '='.

list_in_eq([H|T], 0, [H|Res]) :-
    is_operator(H),
    list_in_eq(T, _, Res), !.
list_in_eq([H|T], Count, Res):-
    list_in_eq(T, Count1, R),
    ((Count1 =:= 0, list_in_eq_0(H,R,Res));(Count1 > 0,list_in_eq_1(H,R,Count1,Res))),
    Count is Count1 +1,!.
list_in_eq_0(H,R, [H|R]):-!.
list_in_eq_1(H, [H1|T1],Count, [ResN|T1]):-
    power10(Count, Powered),
    ResN is H*Powered + H1,!.


eq_in_l([H], R):- int_L(H, R),!.
eq_in_l([H|[Ch|T]], R):-
    int_L(H, I),
    append(I, [Ch], R1),
    eq_in_l(T, Rt),
    append(R1, Rt, R),!.

int_L(0, []):-!.
int_L(N, Res):-
    N1 is N div 10,
    G is N mod 10,
    int_L(N1, R),
    append(R,[G],Res),!.

power10(1,10):-!.
power10(Power, Res) :-
    Power1 is Power - 1,
    power10(Power1, Res1),
    Res is 10*Res1.


iss_list([_]).
iss_list([_|T]):- iss_list(T).

totobola([],[]).
totobola([H|T],[X|LR]):- iss_list(H), !, member(X,H), totobola(T,LR).
totobola([H|T],[H|LR]):- totobola(T,LR).

clear_price(L, P, R):-
    findall(Res, (totobola(L,Res),sump(Res,N),N=:=P),R),!.

sump([],0):-!.
sump([[]|T],R):-
    sump(T,R),!.
sump([[_|P]|T],R):-
    sump(T,R1),
    R is R1+P.

move_list([], [], []).
move_list([H|T], [[]|T1], [H|R]):-
    move_list(T, T1, R),!.
move_list([_|T], [[Ch,_]|T1], [Ch|R]):-
    move_list(T, T1, R).

arifm([N1,=,N1]):-!.
arifm([N1|['-'|[N2|T]]]):-
    R is N1-N2,
    arifm([R|T]),!.
arifm([N1|['+'|[N2|T]]]):-
    R is N1+N2,
    arifm([R|T]).

x(L, P, Ch, R):-
    clear_price(Ch, P, F),
    member(X, F),
    move_list(L, X, Res),
    list_in_eq(Res, _, R).

is_operator(H) :- member(H, ['+', '-', '=']).

both_are_operators(S1, S2) :-
    is_operator(S1),
    is_operator(S2).

solution(L,P,R):-
    changes(L, P, Ch),
    x(L, P, Ch, R),
    append(_,[E],R),
    \\+ (E=='false'),
    append(_,[S1|[S2,_]],R),
    \\+ both_are_operators(S1, S2),
    arifm(R).
    
generator(R,P,G):-
    changes_backward(R, P, Ch2),
    x(R,P, Ch2, G),
    append(_,[E],G),
    \\+ (E=='false').

game(L,P,Res,Gen):-
    findall(R, solution(L,P,R), Res),
    findall(G, (member(R,Res),eq_in_l(R,E),generator(E,P,G)), Genn),
    sort(Genn,Gen),!.
`;

    // Консультування з програмою
    session.consult(program, {
        success: function() {
            // Запит
            let query = `game([${prologInput}], ${matchesToRemove}, Res, Gen).\n`;
            session.query(query, {
                success: function(goal) {
                    // Отримання відповіді
                    session.answer({
                        success: function(answer) {
                            // Використання форматування відповіді
                            let formattedSolution = parsePrologOutput(session.format_answer(answer));
                            res.json(formattedSolution);
                        },
                        fail: function() {
                            res.json({solution: "No solution found."});
                        },
                        error: function(err) {
                            console.error(err);
                            res.status(500).json({error: "Prolog execution error."});
                        }
                    });
                },
                error: function(err) {
                    console.error(err);
                    res.status(500).json({error: "Query error."});
                }
            });
        },
        error: function(err) {
            console.error(err);
            res.status(500).json({error: "Consult error."});
        }
    });
});

function convertEquationToPrologList(equation) {
    return equation.split('').map(c => isNaN(parseInt(c)) ? `'${c}'` : c).join(', ');
}

function parsePrologOutput(stdout) {
    // Перетворюємо вивід Prolog у зручний для читання формат
    // Цей код потрібно адаптувати залежно від точного формату виводу Prolog
    const lines = stdout.split('\n').filter(line => line.trim() !== '');
    const resPattern = /Res = (.+).$/;
    const genPattern = /Gen = (.+).$/;
    let resMatch = lines.find(line => resPattern.test(line));
    let genMatch = lines.find(line => genPattern.test(line));

    let resOutput = resMatch ? formatPrologList(resMatch.match(resPattern)[1].split(" Gen = ")[0]) : 'Рішення не знайдено';
    let genOutput = genMatch ? formatPrologList(genMatch.match(genPattern)[1]) : 'Додаткові рішення не знайдені';

    return { solution: resOutput, additionalSolution: genOutput };
}

function formatPrologList(prologList) {
    // Перетворює список Prolog у рядок для відображення
    // Видаляємо зайві символи для чистого виводу
    let formattedString = prologList
        .replace(/\[\[/g, '') // Видаляємо подвійні відкриваючі квадратні дужки
        .replace(/\]\]/g, '') // Видаляємо подвійні закриваючі квадратні дужки
        .replace(/\],\s*\[/g, '; ') // Заміняємо ], [ на "; "
        .replace(/\[|\]/g, '') // Видаляємо всі одинарні квадратні дужки
        .replace(/,/g, ''); // Видаляємо коми для кращого читання

    return formattedString;
}


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});


// app.post('/solve', (req, res) => {
//     const equation = req.body.equation; // Отримуємо рівняння з тіла запиту
//     const matchesToRemove = req.body.matchesToRemove; // Отримуємо кількість сірників для видалення
//     const prologInput = convertEquationToPrologList(equation);
//     const prologQuery = `гра([${prologInput}], ${matchesToRemove}, Res, Gen).\n`;
//
//     const process = exec('swipl -s logic.pl', {shell: "/bin/bash"}, (error, stdout, stderr) => {
//         if (error) {
//             console.error(`exec error: ${error}`);
//             return res.status(500).send({ error: "Internal Server Error" });
//         }
//
//         console.log("Prolog вивід:", stdout); // Логуємо вивід Prolog
//
//         const output = parsePrologOutput(stdout);
//         res.send(output);
//     });
//
//     if (process.stdin) {
//         process.stdin.write(prologQuery);
//         process.stdin.end();
//     }
// });


