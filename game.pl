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
is_operator(+). 
is_operator(-). 
is_operator(=).

%change(+Numb, +Integer, ?Res, ?Integer)
change(Numb, N, Res, X):-
    perehid(Numb, Res, X),
    N+1 > X.

%changes(+List, +Integer , -List)
changes([], _, []):-!.
changes([H|T], Price, [[[]|L]|Changes]):-
    findall([Res,X], change(H, Price, Res, X), L),
    changes(T, Price, Changes).

%changes_backward(+List, +Integer , -List)
changes_backward([], _, []):-!.
changes_backward([H|T], Price, [[[]|L]|Changes]):-
    findall([Res,X], change(Res, Price, H, X), L),
    changes_backward(T, Price, Changes).

%list_in_eq(+List, ?Integer, ?List)
list_in_eq([0|[E|_]], 0, ['false']):-not(is_operator(E)),!.
list_in_eq([], 0, []):-!.
list_in_eq([H|T], Count, Res):-
    H == null,
    list_in_eq(T, Count, Res),!.
list_in_eq([H|T], 0, [H|Res]):-
    (H=='+';H=='-';H=='='),
    list_in_eq(T, _, Res),!.
list_in_eq([H|T], Count, Res):-
    list_in_eq(T, Count1, R),
    ((Count1 =:= 0, list_in_eq_0(H,R,Res));(Count1 > 0,list_in_eq_1(H,R,Count1,Res))),
    Count is Count1 +1,!.
list_in_eq_0(H,R, [H|R]):-!.
list_in_eq_1(H, [H1|T1],Count, [ResN|T1]):-
    power10(Count, Powered),
    ResN is H*Powered + H1,!.
%eq_in_l(+List, ?List)
eq_in_l([H], R):- int_L(H, R),!.
eq_in_l([H|[Ch|T]], R):-
    int_L(H, I),
    append(I, [Ch], R1),
    eq_in_l(T, Rt),
    append(R1, Rt, R),!.

%int_L(+Integer, ?List)
int_L(0, []):-!.
int_L(N, Res):-
    N1 is N div 10,
    G is N mod 10,
    int_L(N1, R),
    append(R,[G],Res),!.
    
%power10(+Integer, +Integer)
power10(1,10):-!.
power10(Power, Res) :-
    Power1 is Power - 1,
    power10(Power1, Res1),
    Res is 10*Res1.

%iss_list(+List)
iss_list([_]).
iss_list([_|T]):- iss_list(T).

%totobola(+List,-List)
totobola([],[]).
totobola([H|T],[X|LR]):- iss_list(H), !, member(X,H), totobola(T,LR).
totobola([H|T],[H|LR]):- totobola(T,LR).

%clear_price(+List, +Integer, -List)
clear_price(L, P, R):-
    findall(Res, (totobola(L,Res),sump(Res,N),N=:=P),R),!.

%sump(+List,?Integer)
sump([],0):-!.
sump([[]|T],R):-
    sump(T,R),!.
sump([[_|P]|T],R):-
    sump(T,R1),
    R is R1+P.
%move_list(+List, +List, -List)
move_list([], [], []).
move_list([H|T], [[]|T1], [H|R]):-
    move_list(T, T1, R),!.
move_list([_|T], [[Ch,_]|T1], [Ch|R]):-
    move_list(T, T1, R).
%arifm(+List)
arifm([N1,=,N1]):-!.
arifm([N1|['-'|[N2|T]]]):-
    R is N1-N2,
    arifm([R|T]),!.
arifm([N1|['+'|[N2|T]]]):-
    R is N1+N2,
    arifm([R|T]).
%x(+List,+Integer, +List, -List)
x(L, P, Ch, R):-
    clear_price(Ch, P, F),
    member(X, F),
    move_list(L, X, Res),
    list_in_eq(Res, _, R).

%solution(+List,+Integer, -List)
solution(L,P,R):-
    changes(L, P, Ch),
    x(L, P, Ch, R),
    append(_,[E],R),
    not(E=='false'),
    append(_,[S1|[S2,_]],R),
    not((is_operator(S1),is_operator(S2))),
    arifm(R).

%generator(+List,+Integer, -List)
generator(R,P,G):-
    changes_backward(R, P, Ch2),
    x(R,P, Ch2, G),
    append(_,[E],G),
    not(E=='false').

%game(+List,+Integer, -List, -List)
game(L,P,Res,Gen):-
    findall(R, solution(L,P,R), Res),
    findall(G, (member(R,Res),eq_in_l(R,E),generator(E,P,G)), Genn),
    sort(Genn, Gen),!.
    