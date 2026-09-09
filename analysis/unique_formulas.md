# 鍞竴鍏紡绺借〃 (鍘婚噸)

## Sheet: Home   (formula cells: 821 / total 821)

---

## Sheet: Air-side   (formula cells: 23745 / total 23745)
- [x17847] family: ``
    e.g. ``
- [x52] family: `@/@`
    e.g. `AU15/P13`
- [x50] family: `POWER((1/(-1.8*LOG((6.9/@+POWER(((@/@)/3.71),1.11)),10))),2)`
    e.g. `POWER((1/(-1.8*LOG((6.9/AX5+POWER((($P$7/AX9)/3.71),1.11)),10))),2)`
- [x50] family: `@*(@/1000)/@`
    e.g. `P13*(AX9/1000)/$AO$12`
- [x49] family: `@*0.5*@*16*@*@/(POWER(PI(),2)*POWER((@/1000),5))`
    e.g. `AX6*0.5*$P$6*16*AU15*AU15/(POWER(PI(),2)*POWER((AX9/1000),5))`
- [x48] family: `((@/PI())^0.5)*2*1000`
    e.g. `((BD12/PI())^0.5)*2*1000`
- [x34] family: `IF(@>0,@,0)`
    e.g. `IF($BK87>0,BL69,0)`
- [x21] family: `@`
    e.g. `P15`
- [x18] family: `(@/1000)*PI()+((@/1000)-(@/1000))*2`
    e.g. `($BK15/1000)*PI()+((BL15/1000)-($BK15/1000))*2`
- [x18] family: `IF(@>0,((@/1000)/2)^2*PI()+((@/1000)-(@/1000))*(@/1000),0)`
    e.g. `IF(BL15>0,(($BK15/1000)/2)^2*PI()+((BL15/1000)-($BK15/1000))*($BK15/1000),0)`
- [x18] family: `IF(@=@,@,0)`
    e.g. `IF(L6=L7,K6,0)`
- [x12] family: `IF(@=0,"-",SUM(@))`
    e.g. `IF(K6=0,"-",SUM(AI2:AL2))`
- [x9] family: `IF(@=@,@/0.472,0)`
    e.g. `IF(L6=L7,AI4/0.472,0)`
- [x8] family: `SUM(@)`
    e.g. `SUM(AI17:AL17)`
- [x6] family: `1.453*(@^0.6)/(@^0.2)`
    e.g. `1.453*(AY13^0.6)/(AZ13^0.2)`
- [x6] family: `((@/1000+@/1000)*2)`
    e.g. `((P17/1000+Q17/1000)*2)`
- [x6] family: `IF(@=@,@*3.6,0)`
    e.g. `IF(L6=L9,K6*3.6,0)`
- [x6] family: `IF(@=@,@/1000,0)`
    e.g. `IF(L6=L9,K6/1000,0)`
- [x5] family: `@/1000*@/1000`
    e.g. `AW13/1000*AX13/1000`
- [x4] family: `IF(@<=@,@,"")`
    e.g. `IF($BK$106<=CL69,BK69,"")`
- [x4] family: `(1.453*(@^0.6))/((@^0.2))*1000`
    e.g. `(1.453*(BL33^0.6))/((BL51^0.2))*1000`
- [x3] family: `@/0.472`
    e.g. `AI19/0.472`
- [x3] family: `IF(@=@,@/3600,0)`
    e.g. `IF(L6=L7,K6/3600,0)`
- [x3] family: `IF(@="x","x",IF(AND(@>0,@>0),@,IF(AND(@>0,@>0),@,IF(AND(@>0,@>0,@>0),@,"-"))))`
    e.g. `IF(T15="x","x",IF(AND(T12>0,P13>0),AX7,IF(AND(T12>0,P15>0),BD7,IF(AND(T12>0,P17>0,Q17>0),BH9,"-"))))`
- [x3] family: `IF(@=@,@*0.472,0)`
    e.g. `IF(L6=L10,K6*0.472,0)`
- [x3] family: `IF(@=@,@*3600,0)`
    e.g. `IF(L6=L8,K6*3600,0)`
- [x3] family: `IF(@=@,@/3.6,0)`
    e.g. `IF(L6=L7,K6/3.6,0)`
- [x3] family: `IF(@=@,@*1000,0)`
    e.g. `IF(L6=L8,K6*1000,0)`
- [x3] family: `INDEX(@,@)+(@-INDEX(@,@))*(INDEX(@,@+1)-INDEX(@,@))/(INDEX(@,@+1)-INDEX(@,@))`
    e.g. `INDEX(BC12:BC3011,BE8) + (BD7-INDEX(BH12:BH3011,BE8)) * (INDEX(BC12:BC3011,BE8+1)-INDEX(BC12:BC3011,BE8)) / (INDEX(BH12:BH3011,BE8+1)-INDEX(BH12:BH3011,BE8))`
- [x2] family: `IF(@*@>0,@*@,"-")`
    e.g. `IF(G8*G9>0,G8*G9,"-")`
- [x2] family: `@*3600`
    e.g. `AJ18*3600`
- [x2] family: `IF(@="-","-",@*@)`
    e.g. `IF(AD20="-","-",AD20*AD17)`
- [x2] family: `IF(@="-","-",IF(@>0,@/@,"-"))`
    e.g. `IF(X8="-","-",IF(X26>0,X6/X26,"-"))`
- [x2] family: `@*1000`
    e.g. `AI18*1000`
- [x2] family: `IF(@=@,1,IF(@>@,@/@,IF(@>@,@/@)))`
    e.g. `IF(P17=Q17,1,IF(P17>Q17,P17/Q17,IF(Q17>P17,Q17/P17)))`
- [x2] family: `IF(OR(@=0,@="-"),"-",MROUND((@/(@*10^-3))*1000,50))`
    e.g. `IF(OR(X19=0,X16="-"),"-",MROUND((X16/(X19*10^-3))*1000,50))`
- [x2] family: `MAX(@)`
    e.g. `MAX(BL69:CK69)`
- [x2] family: `IF(OR(@="-",@="-"),"-",@/@)`
    e.g. `IF(OR(Y15="-",X8="-"),"-",X8/Y15)`
- [x2] family: `MATCH(@,@)`
    e.g. `MATCH(BD7,BH12:BH3011)`
- [x2] family: `18.474*10^-6`
    e.g. `18.474*10^-6`
- [x2] family: `VLOOKUP(@,@,2)`
    e.g. `VLOOKUP(P5,AN2:AO5,2)`
- [x2] family: `@/1000`
    e.g. `AK19/1000`
- [x1] family: `IF(OR(AND(@>0,@>0),AND(@>0,@>0),AND(@>0,@>0)),"x","-")`
    e.g. `IF(OR(AND(P13>0,P15>0),AND(P13>0,P17>0),AND(P15>0,P17>0)),"x","-")`
- [x1] family: `IF(@="-",0,1)`
    e.g. `IF(P22="-",0,1)`
- [x1] family: `(1+@)/@`
    e.g. `(1+AO10)/AO9`
- [x1] family: `IF(@="-","-",@*0.472)`
    e.g. `IF(G12="-","-",G14*0.472)`
- [x1] family: `IF(SUM(@)=0,"-",HLOOKUP(@,@,2,FALSE))`
    e.g. `IF(SUM(BL130:CK130)=0,"-",HLOOKUP(BJ108,BL129:CK130,2,FALSE))`
- [x1] family: `IF(@=0,"",IF(MIN(@)=0,"n/a","*Minovalductheight="&MIN(@)))`
    e.g. `IF(AU20=0,"",IF(MIN(CM69:CM85)=0,"n/a","*Min oval duct height = "&MIN(CM69:CM85)))`
- [x1] family: `1.453*(@^0.6)/(@^0.2)*1000`
    e.g. `1.453*(BI4^0.6)/(BI6^0.2)*1000`
- [x1] family: `VLOOKUP(@,@,5)`
    e.g. `VLOOKUP(AO7,AO2:AS6,5)`
- [x1] family: `IF(AND(@>0,OR(AND(@>0,@>0),AND(@>0,@>0))),@*@,"-")`
    e.g. `IF(AND(P36>0,OR(AND(P15>0,AU15>0),AND(P13>0, AU15>0))),P34*P36,"-")`
- [x1] family: `IF(@="x","-",IF(AND(@>0,@>0),@,"-"))`
    e.g. `IF(P20="x","-",IF(AND(AU15>0,P25>0),BA10,"-"))`
- [x1] family: `IF(@*@=0,"-",@*@)`
    e.g. `IF(X12*X15=0,"-",X15*X12)`
- [x1] family: `IF(@="-","-",@/3600)`
    e.g. `IF(G12="-","-",G12/3600)`
- [x1] family: `IF(@>0,ROUNDUP(@/@,0),"-")`
    e.g. `IF(Y19>0,ROUNDUP(Y20/Y19,0),"-")`
- [x1] family: `IF(OR(@="-",@="-"),"-",@/@*0.45/@/@)`
    e.g. `IF(OR(AD6="-",AD13="-"),"-",AD8/AD13*0.45/AD17/AD18)`
- [x1] family: `VLOOKUP(@,@,3)`
    e.g. `VLOOKUP(AO7,AO2:AS6,3)`
- [x1] family: `IF(@>0,@/@,"-")`
    e.g. `IF(Y19>0,X6/X22,"-")`
- [x1] family: `IF(@="x","-",IF(OR(AND(@>0,@>0),AND(@>0,@>0)),0.5*@*@^2,"-"))`
    e.g. `IF(P20="x","-",IF(OR(AND(P15>0,AU15>0),AND(P13>0,AU15>0)),0.5*$P$6*P21^2,"-"))`
- [x1] family: `IF(@="-","-",@*1000)`
    e.g. `IF(G12="-","-",G13*1000)`
- [x1] family: `IF(AND(@>0,@>0,@>4),"Unacceptable(>1:4)",IF(AND(@>0,@>0,@<4),"Acceptable","-"))`
    e.g. `IF(AND(P17>0,Q17>0,AU2>4),"Unacceptable (> 1:4)",IF(AND(P17>0,Q17>0,AU2<4),"Acceptable","-"))`
- [x1] family: `@/3600`
    e.g. `AI17/3600`
- [x1] family: `IF(@>0,IF(@>4,"Unacceptable(>1:4)","Acceptable"),"-")`
    e.g. `IF(P25>0,IF(AU8>4,"Unacceptable (> 1:4)","Acceptable"),"-")`
- [x1] family: `IF(@*@*@*@>0,((@/1000*@/1000)+(@/1000*@/1000)*2+(@/1000*@/1000)*2)*@,"-")`
    e.g. `IF(X37*X38*X39*X40>0,((X37/1000*X38/1000)+(X38/1000*X39/1000)*2+(X37/1000*X39/1000)*2)*X40,"-")`
- [x1] family: `IF(AND(@*@>0,@>0),@/@,"-")`
    e.g. `IF(AND(K12*K13>0,K6>0),K7/K14,"-")`
- [x1] family: `(((@/PI())^0.5)*2)*1000`
    e.g. `(((AX4/PI())^0.5)*2)*1000`
- [x1] family: `IF(@="x","-",IF(@="-","-",IF(@>1.5,"Over","Acceptable")))`
    e.g. `IF(P20="x","-",IF(P20="-","-",IF(P20>1.5,"Over","Acceptable")))`
- [x1] family: `IF(@>0,1,IF(@>0,2,IF(AND(@>0,@>0),3,"-")))`
    e.g. `IF(P13>0,1,IF(P15>0,2,IF(AND(P17>0,Q17>0),3,"-")))`
- [x1] family: `IF(COUNTA(@)=1,@/1000,IF(COUNTA(@)=1,@/1000,"-"))`
    e.g. `IF(COUNTA(P13)=1,AX9/1000,IF(COUNTA(P15)=1,BD9/1000,"-"))`
- [x1] family: `@*3.6`
    e.g. `AL19*3.6`
- [x1] family: `IF(@="-","-",IF(@>0,@/@/@,"-"))`
    e.g. `IF(X8="-","-",IF(X26>0,X8/X26/X21,"-"))`
- [x1] family: `18.312*10^-6`
    e.g. `18.312*10^-6`
- [x1] family: `17.78*10^-6`
    e.g. `17.78*10^-6`
- [x1] family: `IF(AND(@=0,@=0),"-",IF(@>0,@,VLOOKUP(@,@,2,FALSE)))`
    e.g. `IF(AND(AD12=0,AD14=0),"-",IF(AD14>0,AD14,VLOOKUP(AD12,AC27:AD29,2,FALSE)))`
- [x1] family: `IF(@="x","-",IF(@>0,@,"-"))`
    e.g. `IF(P20="x","-",IF(P25>0,AU8,"-"))`
- [x1] family: `IF(@="-",@,IF(@="-",@,"-"))`
    e.g. `IF(AU9="-",AU3,IF(AU3="-",AU9,"-"))`
- [x1] family: `(@/PI()*4)^0.5*1000`
    e.g. `(BH3/PI()*4)^0.5*1000`
- [x1] family: `IF(@>0,IF(OR(AND(@="acceptable",@="acceptable"),AND(@="Acceptable",@=0)),"a","r"),"0")`
    e.g. `IF(AU15>0,IF(OR(AND(U25="acceptable",AU9="acceptable"),AND(U25="Acceptable",P25=0)),"a","r"),"0")`
- [x1] family: `ROUND(IF(@<@,@/@,@/@),2)`
    e.g. `ROUND(IF(P17<Q17,Q17/P17,P17/Q17),2)`
- [x1] family: `@*0.472`
    e.g. `AL20*0.472`
- [x1] family: `(@/1000)*(@/1000)`
    e.g. `(P17/1000)*(Q17/1000)`
- [x1] family: `IF(@*@*@=0,"-",((@+@)/1000*@)*2)`
    e.g. `IF(P42*P43*P44=0,"-",((P42+P43)/1000*P44)*2)`
- [x1] family: `VLOOKUP(@,@,4)`
    e.g. `VLOOKUP(AO7,AO2:AS6,4)`
- [x1] family: `MIN(@)`
    e.g. `MIN(BL106:CK106)`
- [x1] family: `IF(@*@*@>0,@*@*@,"-")`
    e.g. `IF(G6*G8*G9>0,G6*G8*G9,"-")`
- [x1] family: `IF(@="-","-",IF(@*@>0,@/1000*@/1000,"-"))`
    e.g. `IF(X8="-","-",IF(X19*Y19>0,X19/1000*Y19/1000,"-"))`
- [x1] family: `MROUND(@+20,50)`
    e.g. `MROUND(BA9+20,50)`
- [x1] family: `(@/1000/2)^2*PI()`
    e.g. `(BH5/1000/2)^2*PI()`
- [x1] family: `IF(AND(@>0,@>0),"Aspectratio1:"&@,"")`
    e.g. `IF(AND(P17>0, Q17>0),"Aspect ratio 1 : "&AU17,"")`
- [x1] family: `HLOOKUP(@,@,2,FALSE)`
    e.g. `HLOOKUP(BK107,BL106:CK107,2,FALSE)`

---

## Sheet: Coil   (formula cells: 11877 / total 11877)
- [x6607] family: ``
    e.g. ``
- [x107] family: `@`
    e.g. `D8`
- [x33] family: `(IF(@=0,@,@)/1000/9.81*(@/1000)^1.167/6.819)^(1/1.852)*@`
    e.g. `(IF(DU7=0,DW5,DU7)/1000/9.81*(DP7/1000)^1.167/6.819)^(1/1.852)*DP2`
- [x33] family: `6.819*(IF(@=0,@,@)/@)^1.852/(@/1000)^1.167*1000*9.81`
    e.g. `6.819*(IF(DV7=0,DX5,DV7)/DP2)^1.852/(DP7/1000)^1.167*1000*9.81`
- [x33] family: `0.62198*(@/(@-@))`
    e.g. `0.62198*(CR4/($F$3-CR4))`
- [x33] family: `ROUND(6.819*(@/@)^1.852/(@/1000)^1.167*1000*9.81,0)`
    e.g. `ROUND(6.819*(DS7/DP2)^1.852/(DP7/1000)^1.167*1000*9.81,0)`
- [x33] family: `IF(@<=@,IF(@<=IF(@=0,@,@),@,(@/1000/9.81*(@/1000)^1.167/6.819)^(1/1.852)*@),IF(@<=IF(@=0,@,@),@,"Check"))`
    e.g. `IF(DX7<=DW5,IF(DW7<=IF(DV7=0,DX5,DV7),DW7,(DX7/1000/9.81*(DP7/1000)^1.167/6.819)^(1/1.852)*DP2),IF(DW7<=IF(DV7=0,DX5,DV7),DW7,"Check"))`
- [x30] family: `IF(COUNTA(@,@,@)=2,@,"-")`
    e.g. `IF(COUNTA(D8,E8,F8)=2,DL4,"-")`
- [x28] family: `0.000041764768*POWER(@,2)-0.000000014452093*POWER(@,3)+6.5459673*LN(@)`
    e.g. `0.000041764768*POWER(CO4,2)-0.000000014452093*POWER(CO4,3)+6.5459673*LN(CO4)`
- [x28] family: `-5800.2206/@+1.3914993-0.048640239*@`
    e.g. `-5800.2206/CO4+1.3914993-0.048640239*CO4`
- [x28] family: `273.15+@`
    e.g. `273.15+CM4`
- [x28] family: `EXP(@+@)/1000`
    e.g. `EXP(CP4+CQ4)/1000`
- [x26] family: `@/@`
    e.g. `DE4/CX4`
- [x24] family: `IF(@=0,@,@)`
    e.g. `IF($CN4=0,DC4,DC5)`
- [x23] family: `IF(AND(@=0,@=0),"n/a",@)`
    e.g. `IF(AND(C31=0,C32=0),"n/a",C31)`
- [x18] family: `IF(@+@>0,(6.54+14.526*LN(@)+0.7389*POWER(LN(@),2)+0.09486*POWER(LN(@),3)+0.4569*POWER(@,0.1984)),0)`
    e.g. `IF(CL4+CN4>0,(6.54+14.526*LN(CS5)+0.7389*POWER(LN(CS5),2)+0.09486*POWER(LN(CS5),3)+0.4569*POWER(CS5,0.1984)),0)`
- [x18] family: `IF(@+@>0,0.62198*(@/(@-@)),0)`
    e.g. `IF(CL4+CN4>0,0.62198*(CS5/($F$3-CS5)),0)`
- [x18] family: `IF(@+@>0,(1.006*@+@*(2501+1.805*@)),0)`
    e.g. `IF(CL4+CN4>0,(1.006*CL4+DE5*(2501+1.805*CL4)),0)`
- [x18] family: `IF(@+@>0,@,0)`
    e.g. `IF(CL4+CN4>0,CN4,0)`
- [x16] family: `@/100*@`
    e.g. `CN4/100*CR5`
- [x13] family: `IF(@>0,@,"n/a")`
    e.g. `IF(D10>0,D10,"n/a")`
- [x11] family: `1.02*@`
    e.g. `1.02*F4`
- [x8] family: `IF(@="n/a","n/a",@*3600)`
    e.g. `IF(AN8="n/a","n/a",AN8*3600)`
- [x7] family: `IF(@="n/a","-",VLOOKUP(MIN(@),@,2,TRUE))`
    e.g. `IF(AV17="n/a","-",VLOOKUP(MIN(BZ4:BZ35),BZ4:CA35,2,TRUE))`
- [x7] family: `IF(OR(@=@,@>@),@,"")`
    e.g. `IF(OR(BL4=$O$35,BL4>$O$35),BL4,"")`
- [x6] family: `IF(@+@<>0,@/(1-(1-@)*(@/@))*100,0)`
    e.g. `IF(CL4+CM4<>0,CY4/(1-(1-CY4)*(CW4/$F$3))*100,0)`
- [x6] family: `IF(@+@<>0,1/@,0)`
    e.g. `IF(CL4+CM4<>0,1/DA4,0)`
- [x6] family: `IF(@+@>0,1/@,0)`
    e.g. `IF(CL4+CN4>0,1/CV5,0)`
- [x6] family: `0.2871*(@+273.15)*(1+1.6078*@)/@`
    e.g. `0.2871*(CL4+273.15)*(1+1.6078*DE5)/$F$3`
- [x6] family: `@*@/(0.62198+@)`
    e.g. `$F$3*DE4/(0.62198+DE4)`
- [x6] family: `IF(@+@<>0,(6.54+14.526*LN(@)+0.7389*POWER(LN(@),2)+0.09486*POWER(LN(@),3)+0.4569*POWER(@,0.1984)),0)`
    e.g. `IF(CL4+CM4<>0,(6.54+14.526*LN(CZ4)+0.7389*POWER(LN(CZ4),2)+0.09486*POWER(LN(CZ4),3)+0.4569*POWER(CZ4,0.1984)),0)`
- [x6] family: `IF(@>0,'SHEET'!@,"-")`
    e.g. `IF(CN4>0,'Coil Support'!A32,"-")`
- [x6] family: `IF(@+@<>0,(((2501-2.381*@)*@-(@-@))/(2501+1.805*@-4.186*@)),0)`
    e.g. `IF(CL4+CM4<>0,(((2501-2.381*CM4)*CS4-(CL4-CM4))/(2501+1.805*CL4-4.186*CM4)),0)`
- [x6] family: `IF(@+@<>0,1.006*@+@*(2501+1.805*@),0)`
    e.g. `IF(CL4+CM4<>0,1.006*CL4+DE4*(2501+1.805*CL4),0)`
- [x6] family: `IF(COUNTA(@)=1,"-",@)`
    e.g. `IF(COUNTA(F8)=1,"-",DB4)`
- [x6] family: `(0.2871*(@+273.15)*(1+1.6078*@))/@`
    e.g. `(0.2871*(CL4+273.15)*(1+1.6078*DE4))/$F$3`
- [x5] family: `IF(@=TRUE,@,@)`
    e.g. `IF(C20=TRUE,D24,AM26)`
- [x5] family: `INDEX(@,@)+(@-INDEX(@,@))*(INDEX(@,@+1)-INDEX(@,@))/(INDEX(@,@+1)-INDEX(@,@))`
    e.g. `INDEX(EB10:EB109,EM6) + (EL6-INDEX(EM10:EM109,EM6)) * (INDEX(EB10:EB109,EM6+1)-INDEX(EB10:EB109,EM6)) / (INDEX(EM10:EM109,EM6+1)-INDEX(EM10:EM109,EM6))`
- [x5] family: `IF(@="-","n/a",@)`
    e.g. `IF(H9="-","n/a",H9)`
- [x5] family: `IF(OR(@="-",@=0),"n/a",@)`
    e.g. `IF(OR(I8="-",C32=0),"n/a",I8)`
- [x5] family: `IF(COUNTA(@)=1,@,"n/a-")`
    e.g. `IF(COUNTA(D39)=1,D39,"n/a -")`
- [x5] family: `MATCH(@,@)`
    e.g. `MATCH(EL6,EM10:EM109)`
- [x4] family: `IF(OR(@=0,@=FALSE),"n/a",@)`
    e.g. `IF(OR(C42=0,D20=FALSE),"n/a",CG56)`
- [x4] family: `IF(@="n/a",0,@)`
    e.g. `IF(AF7="n/a",0,AF7)`
- [x3] family: `IF(COUNTA(@,@,@,@)<4,"n/a",(@*@+@*@)/@)`
    e.g. `IF(COUNTA(D8,D10,C31,C32)<4,"n/a",(O6*P6+R6*S6)/M6)`
- [x3] family: `IF(COUNTA(@)=1,@,"n/a)")`
    e.g. `IF(COUNTA(C39)=1,C39,"n/a )")`
- [x3] family: `IF(COUNTA(@,@)<2,"n/a",@)`
    e.g. `IF(COUNTA(C31,C32)<2,"n/a",C32)`
- [x3] family: `IF(AND(@=TRUE,@>@,COUNTA(@)=1),'SHEET'!@,"-")`
    e.g. `IF(AND(C20=TRUE,D24>D9,COUNTA(D24)=1),'Coil Support'!CV32,"-")`
- [x3] family: `COUNTA(@)`
    e.g. `COUNTA(D23)`
- [x3] family: `IF(@=TRUE,IF(@="n/a","n/a/",ABS(@)),"n/a/")`
    e.g. `IF(D20=TRUE,IF(AF21="n/a","n/a /",ABS(AF21)),"n/a /")`
- [x3] family: `IF(COUNTA(@,@,@,@)<4,"n/a",@*@*(@-@))`
    e.g. `IF(COUNTA(D8,D10,C31,C32)<4,"n/a",O20*P20*(R20-S20))`
- [x3] family: `IF(OR(@="n/a/",@="n/a",@="n/a"),"n/a",@/@)`
    e.g. `IF(OR(BD7="n/a /",AV30="n/a",BE7="n/a"),"n/a",BD7/BE7)`
- [x3] family: `IF(@>0,@,"n/a)")`
    e.g. `IF(C39>0,C39,"n/a )")`
- [x3] family: `IF(OR(@="n/a",@="n/a",COUNTA(@,@)<2),"n/a",@/(@-@)/@)`
    e.g. `IF(OR(M34="n/a",O42="n/a",COUNTA(C39,D39)<2),"n/a",M34/(R34-S34)/P34)`
- [x3] family: `IF(AND(COUNTA(@)=1,@=TRUE,@>@),'SHEET'!@,"-")`
    e.g. `IF(AND(COUNTA(D23)=1,B20=TRUE,D23>D22),'Coil Support'!CK32,"-")`
- [x2] family: `IF(OR(@="-",@=0),"n/a",@*@*(@-@))`
    e.g. `IF(OR(I8="-",C32=0),"n/a",AV7*AW7*(AY7-AZ7))`
- [x2] family: `IF(@=FALSE,"ts1)",IF(@=TRUE,"ts2)","n/a)"))`
    e.g. `IF(B20=FALSE,"ts1)",IF(B20=TRUE,"ts2)","n/a )"))`
- [x2] family: `IF(@*@=0,"n/a",@)`
    e.g. `IF(D8*C32=0,"n/a",D8)`
- [x2] family: `IF(@="-","n/a)",@)`
    e.g. `IF(I10="-","n/a )",I10)`
- [x2] family: `IF(OR(@="-",@="-"),"","R")`
    e.g. `IF(OR(I11="-",H11="-"),"","R")`
- [x2] family: `IF(@<=@,@,"")`
    e.g. `IF($O$43<=BM39,BM39,"")`
- [x2] family: `IF(@*@>0,@,"n/a")`
    e.g. `IF(E14*C31>0,E14,"n/a")`
- [x2] family: `IF(@*@*@=0,"n/a",@*@*(@-@))`
    e.g. `IF(D8*D10*C31=0,"n/a",W6*X6*(Z6-AA6))`
- [x2] family: `IF(@="n/a","n/a",@*@*(@-@))`
    e.g. `IF(AV21="n/a","n/a",AV21*AW21*(AY21-AZ21))`
- [x2] family: `IF(@=FALSE,"n/a",SUM(@,@,@))`
    e.g. `IF(I20=FALSE,"n/a",SUM(AN9,AN14,AN20))`
- [x2] family: `IF(@="n/a","-","")`
    e.g. `IF(AV22="n/a","-","[CDP: Ø"&VLOOKUP(MIN(BZ39:BZ46),BZ39:CA46,2,FALSE)&"]")`
- [x2] family: `IF(AND(COUNTA(@)=1,@=TRUE,@>@),@,"-")`
    e.g. `IF(AND(COUNTA(D23)=1,B20=TRUE,D23>D22),H22,"-")`
- [x2] family: `IF(@=FALSE,IF(@="n/a","n/a",-@),"n/a")`
    e.g. `IF(D20=FALSE, IF(AF29="n/a","n/a",-AF29),"n/a")`
- [x2] family: `IF(@=0,"n/a",@)`
    e.g. `IF(E17=0,"n/a",E17)`
- [x2] family: `IF(@=FALSE,"to-","tpre-")`
    e.g. `IF(C20=FALSE,"to -","tpre -")`
- [x2] family: `IF(AND(@=TRUE,@=FALSE),IF(@="n/a","n/a",-@),"n/a")`
    e.g. `IF(AND(C20=TRUE,D20=FALSE), IF(AF21="n/a","n/a",-AF21),"n/a")`
- [x2] family: `IF(@=FALSE,IF(@="-","n/a)",@),IF(@=TRUE,@,"n/a)"))`
    e.g. `IF(B20=FALSE,IF(H22="-","n/a )",H22),IF(B20=TRUE,H23,"n/a )"))`
- [x2] family: `IF(@*@*@*@=0,"n/a)",@)`
    e.g. `IF(D8*D10*C31*D22=0,"n/a )",D22)`
- [x2] family: `IF(@="n/a","","M")`
    e.g. `IF(AF11="n/a","","M")`
- [x2] family: `IF(@*@*@>0,@,0)`
    e.g. `IF(D8*D10*C31>0,O7,0)`
- [x2] family: `IF(OR(@="-",@="-",@="-"),"n/a",@)`
    e.g. `IF(OR(I8="-",I10="-",C31="-"),"n/a",O7)`
- [x2] family: `IF(@=FALSE,"ws1)",IF(@=TRUE,"ws2)","n/a)"))`
    e.g. `IF(B20=FALSE,"ws1)",IF(B20=TRUE,"ws2)","n/a )"))`
- [x2] family: `IF(OR(AND(@=0,@=TRUE),@=FALSE,@<@),"n/a)",@)`
    e.g. `IF(OR(AND(BU45=0,C20=TRUE),C20=FALSE,D24<D9),"n/a )",D24)`
- [x2] family: `IF(@*@=0,"n/a)",@)`
    e.g. `IF(D11*C31=0,"n/a )",D11)`
- [x2] family: `IF(@="-","n/a-",IF(@=FALSE,@,IF(AND(@=1,@=TRUE,@>@),@,"n/a-")))`
    e.g. `IF(H9="-","n/a -",IF(C20=FALSE,D9,IF(AND(BU45=1,C20=TRUE,D24>D9),D24,"n/a -")))`
- [x2] family: `IF(AND(@=TRUE,@>@,COUNTA(@)=1),@,"-")`
    e.g. `IF(AND(C20=TRUE,D24>D9,COUNTA(D24)=1),H9,"-")`
- [x2] family: `IF(OR(@="-",@="-"),"","O")`
    e.g. `IF(OR(I9="-",H9="-"),"","O")`
- [x1] family: `IF(OR(@=FALSE,@<0,@="-"),"","PH")`
    e.g. `IF(OR(C20=FALSE,D24<0,H9="-"),"","PH")`
- [x1] family: `IF(@*@*@=0,"n/a",@)`
    e.g. `IF(D8*D10*C31=0,"n/a",D10)`
- [x1] family: `IF(OR(@=TRUE,@=TRUE),TRUE,FALSE)`
    e.g. `IF(OR(D20=TRUE, E20=TRUE), TRUE,FALSE)`
- [x1] family: `IF(@=FALSE,"wo","wpre")`
    e.g. `IF(C20=FALSE,"wo","wpre")`
- [x1] family: `@-2*@`
    e.g. `DO7-2*DQ7`
- [x1] family: `IF(@*@*@=0,"n/a)",IF(@=TRUE,@,@))`
    e.g. `IF(D10*C31*D22=0,"n/a )",IF(B20=TRUE,D23,D22))`
- [x1] family: `-@`
    e.g. `-E17`
- [x1] family: `IF(@="n/a","","@")`
    e.g. `IF(AF7="n/a","","S1")`
- [x1] family: `IF(@=FALSE,"to","tpre")`
    e.g. `IF(C20=FALSE,"to","tpre")`
- [x1] family: `IF(@=TRUE,IF(@>@,"ok","x"),"ok")`
    e.g. `IF(B20=TRUE,IF(D23>D22,"ok","x"),"ok")`
- [x1] family: `IF(@=1,@,"n/a=")`
    e.g. `IF(B4=1,C31,"n/a =")`
- [x1] family: `IF(OR(@="-",@="-"),"","S")`
    e.g. `IF(OR(H25="-",I25="-"),"","S")`
- [x1] family: `IF(OR(@=FALSE,@="-"),"n/a-",@)`
    e.g. `IF(OR(E20=FALSE,H11="-"),"n/a - ",H11)`
- [x1] family: `IF(OR(@="n/a)",@*@*@=0),"n/a",@/@/@+@)`
    e.g. `IF(OR(AA19="n/a )",E14*D10*C31=0),"n/a",U19/W19/X19+AA19)`
- [x1] family: `IF(@*@*@=0,"n/a)",IF(@=FALSE,@,IF(AND(@=TRUE,@=1),@,"n/a)")))`
    e.g. `IF(D10*C31*D22=0,"n/a )",IF(B20=FALSE,D22,IF(AND(B20=TRUE,BU44=1),D23,"n/a )")))`
- [x1] family: `IF(OR(@="n/a)",@="n/a"),"n/a",@/@/(@-@))`
    e.g. `IF(OR(F29="n/a )",B29="n/a"),"n/a",B29/D29/(E29-F29))`
- [x1] family: `IF(@="n/a","n/a)",@)`
    e.g. `IF(AF7="n/a","n/a )",AF7)`
- [x1] family: `IF(AND(@=1,@>0),@,"n/a")`
    e.g. `IF(AND(B4=1,E14>0),E14,"n/a")`
- [x1] family: `IF(OR(@<0,@="-"),"","O")`
    e.g. `IF(OR(D8<0,I8="-"),"","O")`
- [x1] family: `IF(@="-","n/a",IF(@=FALSE,@,IF(AND(@=1,@=TRUE,@>@),@,"n/a")))`
    e.g. `IF(H9="-","n/a",IF(C20=FALSE,D9,IF(AND(BU45=1,C20=TRUE,D24>D9),D24,"n/a")))`
- [x1] family: `IF(@>0,(@*@*(@-@)*2500.8),"n/a")`
    e.g. `IF(C31>0,(W14*X14*(Z14-AA14)*2500.8),"n/a")`
- [x1] family: `IF(OR(@="n/a)",@="-",@="-"),"n/a",@*@*(@-@))`
    e.g. `IF(OR(AJ20="n/a )",H9="-",H11="-"),"n/a",AF20*AG20*(AI20-AJ20))`
- [x1] family: `IF(OR(@="n/a/",@="n/a"),"n/a",@/@)`
    e.g. `IF(OR(AN7="n/a /",AF21="n/a"),"n/a",AN7/AO7)`
- [x1] family: `IF(@="n/a","-",@/@)`
    e.g. `IF(O21="n/a","-",O25/O21)`
- [x1] family: `IF(OR(@=FALSE,@="-"),"n/a)",@)`
    e.g. `IF(OR(E20=FALSE,H9="-"),"n/a )",H9)`
- [x1] family: `IF(COUNTA(@)=0,"n/a-",@)`
    e.g. `IF(COUNTA(D11)=0,"n/a - ",D11)`
- [x1] family: `IF(@=TRUE,"Pre-HWS/R","")`
    e.g. `IF(C20=TRUE,"Pre-HWS/R","")`
- [x1] family: `IF(@="n/a","n/a",(@*@+@*@)/@)`
    e.g. `IF(AF7="n/a","n/a",(AF13*AG13+AI13*AJ13)/AD13)`
- [x1] family: `IF(OR(@="n/a",@="n/a",@="n/a",COUNTA(@,@)<2),"n/a",@/(@-@)/@)`
    e.g. `IF(OR(AD38="n/a",AF21="n/a",AI38="n/a",COUNTA(C41,D41)<2),"n/a",AD38/(AI38-AJ38)/AG38)`
- [x1] family: `IF(@=TRUE,@,"n/a)")`
    e.g. `IF(C20=TRUE,D41,"n/a )")`
- [x1] family: `IF(OR(@="n/a",@="n/a"),"n/a",@*@*(@-@))`
    e.g. `IF(OR(AF11="n/a",AF7="n/a"),"n/a",AF24*AG24*(AI24-AJ24))`
- [x1] family: `IF(@=TRUE,@,"n/a-")`
    e.g. `IF(C20=TRUE,C41,"n/a -")`
- [x1] family: `IF(OR(@="n/a",@=FALSE,@=0),"n/a",@*@*(@-@))`
    e.g. `IF(OR(O28="n/a",B20=FALSE,BU44=0),"n/a",O28*P28*(R28-S28))`
- [x1] family: `IF(@>0,@,"(n/a-")`
    e.g. `IF(E14>0,D10,"( n/a -")`
- [x1] family: `IF(COUNTA(@,@,@,@)<4,"n/a",'SHEET'!@)`
    e.g. `IF(COUNTA(D8,D10,C31,C32)<4,"n/a",'Coil Support'!BO32)`
- [x1] family: `IF(OR(@="n/a",@=0),"n/a",@-(-@/@/@))`
    e.g. `IF(OR(AD6="n/a",C31=0),"n/a",AI6-(-AD6/AF6/AG6))`
- [x1] family: `IF(AND(@=FALSE,@>0),"ts1)",IF(AND(@=TRUE,@>0),"ts2)","n/a)"))`
    e.g. `IF(AND(B20=FALSE,E14>0),"ts1)",IF(AND(B20=TRUE,E14>0),"ts2)","n/a )"))`
- [x1] family: `IF(@="n/a","n/a",@/@)`
    e.g. `IF(AV8="n/a","n/a",AV12/AV8)`
- [x1] family: `IF(@=1,@-@,"n/a")`
    e.g. `IF(B4=1,B34-C32,"n/a")`
- [x1] family: `IF(@=TRUE,"CoolingReheatoff-coil(s2)","")`
    e.g. `IF(B20=TRUE,"Cooling Reheat off-coil (s2)","")`
- [x1] family: `IF(@="n/a","n/a",@+@)`
    e.g. `IF(AH28="n/a","n/a",AF28+AH28)`
- [x1] family: `IF(@="-","n/a",1.02*@)`
    e.g. `IF(F4="-","n/a",1.02*F4)`
- [x1] family: `IF(@=@,@,0)`
    e.g. `IF($C$42=CE43,CF43,0)`
- [x1] family: `IF(OR(@="n/a",@="n/a",@="n/a"),"n/a",@/(@-@)/@)`
    e.g. `IF(OR(AT39="n/a",AV26="n/a",AY39="n/a"),"n/a",AT39/(AY39-AZ39)/AW39)`
- [x1] family: `IF(OR(@<0,@="-"),"","@")`
    e.g. `IF(OR(D22<0,H22="-"),"","S1")`
- [x1] family: `ABS(@-@)`
    e.g. `ABS(W20-D10)`
- [x1] family: `IF(@=1,"Outdoor/Pre-treated","Outdoor")`
    e.g. `IF(B4=1, "Outdoor/ Pre-treated","Outdoor")`
- [x1] family: `IF(@="n/a","n/a",ROUND(@,1)&"-")`
    e.g. `IF(AF11="n/a","n/a",ROUND(AF11,1)&" -")`
- [x1] family: `@/1000/9.81*100`
    e.g. `DW5/1000/9.81*100`
- [x1] family: `IF(OR(@=FALSE,@=0,@="n/a)"),"n/a",@*@*(@-@))`
    e.g. `IF(OR(C20=FALSE,C32=0,AZ29="n/a )"),"n/a",AV29*AW29*(AY29-AZ29))`
- [x1] family: `IF(OR(@="n/a",@="n/a",@="n/a-",@="n/a)"),"n/a",@/(@-@)/@)`
    e.g. `IF(OR(AT43="n/a",AV34="n/a",AY43="n/a -",AZ43="n/a )"),"n/a",AT43/(AY43-AZ43)/AW43)`
- [x1] family: `IF(OR(@=TRUE,@=TRUE),"Steam","")`
    e.g. `IF(OR(D20=TRUE,E20=TRUE),"Steam","")`
- [x1] family: `IF(OR(@="-",@=0),"n/a-",@)`
    e.g. `IF(OR(H9="-",C32=0),"n/a -",D9)`
- [x1] family: `IF(@=FALSE,"n/a)",@)`
    e.g. `IF(E20=FALSE,"n/a )",AF14)`
- [x1] family: `IF(AND(@=TRUE,@>0),@,"n/a")`
    e.g. `IF(AND(E20=TRUE,C32>0),C32,"n/a")`
- [x1] family: `IF(OR(@="-",@="-",@=0,@=FALSE),"n/a",@*@*(@-@))`
    e.g. `IF(OR(H9="-",H25="-",C32=0,E20=FALSE),"n/a",BD18*BE18*(BG18-BH18))`
- [x1] family: `IF(OR(@="n/a",@="n/a"),"-",@/100)`
    e.g. `IF(OR(W20="n/a",W24="n/a"),"-",EM7/100)`
- [x1] family: `SUM(@)`
    e.g. `SUM(CG43:CG55)`
- [x1] family: `IF(@=TRUE,IF(@="n/a","n/a/",ABS(-@)),"n/a/")`
    e.g. `IF(D20=TRUE,IF(AF29="n/a","n/a/",ABS(-AF29)),"n/a /")`
- [x1] family: `PI()*(@/1000)^2/4*@*1000`
    e.g. `PI()*(DP7/1000)^2/4*DS7*1000`
- [x1] family: `IF(OR(@="-",@="-",@="-",@=FALSE),"n/a",@*@*(@-@))`
    e.g. `IF(OR(H9="-",H11="-",C31="-",E20=FALSE),"n/a",AN18*AO18*(AQ18-AR18))`
- [x1] family: `IF(@=FALSE,"n/a",@)`
    e.g. `IF(I8=FALSE,"n/a",I8)`
- [x1] family: `1/((1/@)*3600)*1000`
    e.g. `1/((1/CG56)*3600)*1000`
- [x1] family: `IF(OR(@="n/a",@*@*@=0),"n/a",'SHEET'!@)`
    e.g. `IF(OR(AJ10="n/a",D9*D11*C31=0),"n/a",'Coil Support'!BZ32)`
- [x1] family: `IF(@=TRUE,"PH",@)`
    e.g. `IF(C20=TRUE,"PH",BC39)`
- [x1] family: `IF(AND(@=1,@=TRUE),@,"n/a")`
    e.g. `IF(AND(BU44=1,B20=TRUE),D23,"n/a")`
- [x1] family: `IF(AND(@=FALSE,COUNTA(@)=1,COUNTA(@)=1),@,IF(AND(@=TRUE,COUNTA(@)=1,@=1,@>@),@,"n/a)"))`
    e.g. `IF(AND(B20=FALSE,COUNTA(E14)=1,COUNTA(D22)=1),D22,IF(AND(B20=TRUE,COUNTA(E14)=1,BU44=1,D23>D22),D23,"n/a )"))`
- [x1] family: `IF(OR(@="n/a-",@="n/a)",@="n/a"),"n/a",@*@*(@-@))`
    e.g. `IF(OR(AY33="n/a -",AZ33="n/a )",AV33="n/a"),"n/a",AV33*AW33*(AY33-AZ33))`
- [x1] family: `IF(OR(@="-",COUNTA(@,@)<2),"n/a",((@/(@*@*2500.8))+@))`
    e.g. `IF(OR(AA23="-",COUNTA(C31,E15)<2),"n/a",((U23/(W23*F4*2500.8))+AA23))`
- [x1] family: `IF(OR(@="-",@="-",@="-",@="-"),"n/a)",@)`
    e.g. `IF(OR(I8="-",I10="-",C31="-",I22="-"),"n/a )",I22)`
- [x1] family: `IF(OR(@="n/a",@="n/a"),"n/a",(@*@+@*@)/@)`
    e.g. `IF(OR(AJ10="n/a",AF7="n/a"),"n/a",(AF10*AG10+AI10*AJ10)/AD10)`
- [x1] family: `IF(OR(@="n/a",,COUNTA(@,@)<2),"n/a",@/(@-@)/@)`
    e.g. `IF(OR(AT16="n/a",,COUNTA(C39,D39)<2),"n/a",AT16/(AY16-AZ16)/AW16)`
- [x1] family: `IF(@>0,@,"n/a-")`
    e.g. `IF(C41>0,C41,"n/a - ")`
- [x1] family: `IF(AND(@=TRUE,@>0),@,"n/a-")`
    e.g. `IF(AND(E20=TRUE,H25>0),H25,"n/a -")`
- [x1] family: `IF(AND(@=1,@>0,@>0),@/(@+@),"n/a")`
    e.g. `IF(AND(B4=1,E14>0,E15>0),E14/(E14+E15),"n/a")`
- [x1] family: `IF(COUNTA(@,@,@,@)<4,"n/a",@)`
    e.g. `IF(COUNTA(D8,D10,C31,C32)<4,"n/a",O10)`
- [x1] family: `IF(@*@*@=0,"-",IF(AND(@="ok",@-@>0,@-@>=0,@<=1,@<=@*1.15),"OK","X"))`
    e.g. `IF(D8*D10*C31=0,"-",IF(AND(L23="ok",O21-O25>0,C31-C32>=0,AA20<=1,W24<=H10*1.15),"OK","X"))`
- [x1] family: `IF(OR(@="-",@="-",),"","O")`
    e.g. `IF(OR(I9="-",H9="-",),"","O")`
- [x1] family: `IF(@="n/a","-",@/(@+@))`
    e.g. `IF(W11="n/a","-",W11/(W11+W15))`
- [x1] family: `IF(OR(@=FALSE,AND(@=0,@=0)),"n/a",@)`
    e.g. `IF(OR(E20=FALSE,AND(C31=0,C32=0)),"n/a",C31)`
- [x1] family: `IF(OR(@=FALSE,@<0,@="-"),"","@")`
    e.g. `IF(OR(B20=FALSE,D23<0,H22="-"),"","S2")`
- [x1] family: `@*3.28`
    e.g. `DX5*3.28`
- [x1] family: `IF(@=TRUE,"Preheatoff-coil(tpre)","")`
    e.g. `IF(C20=TRUE,"Preheat off-coil (tpre)","")`
- [x1] family: `IF(OR(@="-",@="-"),"","@")`
    e.g. `IF(OR(I22="-",H22="-"),"","S1")`
- [x1] family: `IF(AND(@=TRUE,COUNTA(@)=1),@,@)`
    e.g. `IF(AND(B20=TRUE,COUNTA(D23)=1),D23,V31)`

---

## Sheet: Coil Support   (formula cells: 2640 / total 2640)
- [x530] family: ``
    e.g. ``
- [x260] family: `0.62198*(@/(@-@))`
    e.g. `0.62198*(A11/(F2-A11))`
- [x240] family: `((2501-2.381*@)*@-(@-@))/(2501+1.805*@-4.186*@)-@`
    e.g. `((2501-2.381*C38)*F38-(B2-C38))/(2501+1.805*B2-4.186*C38)-A14`
- [x40] family: `Coil!@`
    e.g. `Coil!CL4`
- [x20] family: `EXP(-5800.2206/(273.15+@)+1.3914993-0.048640239*(273.15+@)+0.000041764768*POWER((273.15+@),2)-0.000000014452093*POWER((273.15+@),3)+6.5459673*LN(273.15+@))/1000`
    e.g. `EXP(-5800.2206/(273.15+C38)+1.3914993-0.048640239*(273.15+C38)+0.000041764768*POWER((273.15+C38),2)-0.000000014452093*POWER((273.15+C38),3)+6.5459673*LN(273.15+C38))/1000`
- [x20] family: `@`
    e.g. `C38`
- [x10] family: `1.006*@+@*(2501+1.805*@)`
    e.g. `1.006*B2+A14*(2501+1.805*B2)`
- [x10] family: `0.000041764768*POWER(@,2)-0.000000014452093*POWER(@,3)+6.5459673*LN(@)`
    e.g. `0.000041764768*POWER(B5,2)-0.000000014452093*POWER(B5,3)+6.5459673*LN(B5)`
- [x10] family: `@-(@-@)*@/(@-@)`
    e.g. `C38-(C38-B38)*H38/(H38-I38)`
- [x10] family: `6.54+14.526*LN(@)+0.7389*POWER(LN(@),2)+0.09486*POWER(LN(@),3)+0.4569*POWER(@,0.1984)`
    e.g. `6.54+14.526*LN(A11)+0.7389*POWER(LN(A11),2)+0.09486*POWER(LN(A11),3)+0.4569*POWER(A11,0.1984)`
- [x10] family: `IF(ABS(@-@)<0.00005,@,IF(ABS(@-@)<0.00005,@,IF(ABS(@-@)<0.00005,@,IF(ABS(@-@)<0.00005,@,IF(ABS(@-@)<0.00005,@,IF(ABS(@-@)<0.00005,@,IF(ABS(@-@)<0.00005,@,IF(@-@<0.00005,@))))))))`
    e.g. `IF(ABS(I40-H40)<0.00005,J40,IF(ABS(I41-H41)<0.00005,J41,IF(ABS(I42-H42)<0.00005,J42,IF(ABS(I43-H43)<0.00005,J43,IF(ABS(I44-H44)<0.00005,J44,IF(ABS(I45-H45)<0.00005,J45,IF(ABS(I46-H46)<0.00005,J46,IF(I47-H47<0.00005,J47))))))))`
- [x10] family: `-5800.2206/@+1.3914993-0.048640239*@`
    e.g. `-5800.2206/B5+1.3914993-0.048640239*B5`
- [x10] family: `@/@`
    e.g. `A14/A17`
- [x10] family: `EXP(@+@)/1000`
    e.g. `EXP(A6+A7)/1000`
- [x10] family: `@/100*@`
    e.g. `B3/100*A8`
- [x10] family: `0.2871*(@+273.15)*(1+1.6078*@)/@`
    e.g. `0.2871*(B2+273.15)*(1+1.6078*A14)/F2`
- [x10] family: `273.15+@`
    e.g. `273.15+B2`

---

## Sheet: Wheel   (formula cells: 10723 / total 10723)
- [x6941] family: ``
    e.g. ``
- [x45] family: `@`
    e.g. `D8`
- [x25] family: `0.000041764768*POWER(@,2)-0.000000014452093*POWER(@,3)+6.5459673*LN(@)`
    e.g. `0.000041764768*POWER(AH4,2)-0.000000014452093*POWER(AH4,3)+6.5459673*LN(AH4)`
- [x25] family: `0.62198*(@/(@-@))`
    e.g. `0.62198*(AK4/($G$3-AK4))`
- [x25] family: `EXP(@+@)/1000`
    e.g. `EXP(AI4+AJ4)/1000`
- [x25] family: `273.15+@`
    e.g. `273.15+AF4`
- [x24] family: `-5800.2206/@+1.3914993-0.048640239*@`
    e.g. `-5800.2206/AH4+1.3914993-0.048640239*AH4`
- [x21] family: `@/@`
    e.g. `AX4/AQ4`
- [x20] family: `IF(@=0,@,@)`
    e.g. `IF($AG4=0,AU4,AU5)`
- [x17] family: `0.2871*(@+273.15)*(1+1.6078*@)/@`
    e.g. `0.2871*(AE4+273.15)*(1+1.6078*AX5)/$G$3`
- [x17] family: `@/100*@`
    e.g. `AG4/100*AK5`
- [x17] family: `IF(@+@>0,(1.006*@+@*(2501+1.805*@)),0)`
    e.g. `IF(AE4+AG4>0,(1.006*AE4+AX5*(2501+1.805*AE4)),0)`
- [x17] family: `IF(@+@>0,0.62198*(@/(@-@)),0)`
    e.g. `IF(AE4+AG4>0,0.62198*(AL5/($G$3-AL5)),0)`
- [x17] family: `IF(@+@>0,(6.54+14.526*LN(@)+0.7389*POWER(LN(@),2)+0.09486*POWER(LN(@),3)+0.4569*POWER(@,0.1984)),0)`
    e.g. `IF(AE4+AG4>0,(6.54+14.526*LN(AL5)+0.7389*POWER(LN(AL5),2)+0.09486*POWER(LN(AL5),3)+0.4569*POWER(AL5,0.1984)),0)`
- [x12] family: `IF(@=0,"-",@)`
    e.g. `IF(BC4=0,"-",BC4)`
- [x12] family: `IF(@+@>0,@,0)`
    e.g. `IF(AE4+AG4>0,AG4,0)`
- [x10] family: `@*1.02`
    e.g. `G4*1.02`
- [x9] family: `IF(@>0,@,"n/a")`
    e.g. `IF(D18>0,D18,"n/a")`
- [x7] family: `MATCH(@,@)`
    e.g. `MATCH(CG5,CI11:CI110)`
- [x5] family: `IF(@="-","n/a",@)`
    e.g. `IF(I11="-","n/a",D11)`
- [x5] family: `IF(@+0.5>=@,@,@+0.5)`
    e.g. `IF(BH10+0.5>=$D$11,$D$11,BH10+0.5)`
- [x4] family: `(0.2871*(@+273.15)*(1+1.6078*@))/@`
    e.g. `(0.2871*(AE4+273.15)*(1+1.6078*AX4))/$G$3`
- [x4] family: `ROUND(IF(@=0,@,@),1)`
    e.g. `ROUND(IF(AF4=0,BE4,AF4),1)`
- [x4] family: `IF(@="-","-",ROUND(@,1)&"/"&ROUND(@,1))`
    e.g. `IF(I8="-","-",ROUND(D8,1)&"/ "&ROUND(BF4,1))`
- [x4] family: `IF(@+@>0,1/@,0)`
    e.g. `IF(AE4+AG4>0,1/AO5,0)`
- [x4] family: `'SHEET'!@`
    e.g. `'Wheel Support'!AS32`
- [x4] family: `IF(@+@<>0,1.006*@+@*(2501+1.805*@),0)`
    e.g. `IF(AE4+AF4<>0,1.006*AE4+AX4*(2501+1.805*AE4),0)`
- [x4] family: `IF(@+@<>0,(6.54+14.526*LN(@)+0.7389*POWER(LN(@),2)+0.09486*POWER(LN(@),3)+0.4569*POWER(@,0.1984)),0)`
    e.g. `IF(AE4+AF4<>0,(6.54+14.526*LN(AS4)+0.7389*POWER(LN(AS4),2)+0.09486*POWER(LN(AS4),3)+0.4569*POWER(AS4,0.1984)),0)`
- [x4] family: `IF(@="n/a",0,INDEX(@,@)+(@-INDEX(@,@))*(INDEX(@,@+1)-INDEX(@,@))/(INDEX(@,@+1)-INDEX(@,@)))`
    e.g. `IF(CG5="n/a",0,INDEX(BW11:BW110,CH5)+(CG5-INDEX(CI11:CI110,CH5))*(INDEX(BW11:BW110,CH5+1)-INDEX(BW11:BW110,CH5))/(INDEX(CI11:CI110,CH5+1)-INDEX(CI11:CI110,CH5)))`
- [x4] family: `IF(@+@<>0,@/(1-(1-@)*(@/@))*100,0)`
    e.g. `IF(AE4+AF4<>0,AR4/(1-(1-AR4)*(AP4/$G$3))*100,0)`
- [x4] family: `IF(@+@<>0,1/@,0)`
    e.g. `IF(AE4+AF4<>0,1/AT4,0)`
- [x4] family: `IF(@="-","n/a)",@)`
    e.g. `IF(I9="-","n/a )",D9)`
- [x4] family: `@*@/(0.62198+@)`
    e.g. `$G$3*AX4/(0.62198+AX4)`
- [x4] family: `IF(@+@<>0,(((2501-2.381*@)*@-(@-@))/(2501+1.805*@-4.186*@)),0)`
    e.g. `IF(AE4+AF4<>0,(((2501-2.381*AF4)*AL4-(AE4-AF4))/(2501+1.805*AE4-4.186*AF4)),0)`
- [x4] family: `IF(@>0,"-",IF(@=0,"-",@))`
    e.g. `IF(F8>0,"-",IF(AZ4=0,"-",AZ4))`
- [x3] family: `IF(@>0,'SHEET'!@,"-")`
    e.g. `IF(AG4>0,'Wheel Support'!A32,"-")`
- [x3] family: `IF(OR(@=0,@=0),"n/a",IF(@>@,@,@))`
    e.g. `IF(OR(D14=0,D15=0),"n/a",IF(D14>D15,D15,D14))`
- [x3] family: `IF(@="n/a","-",ROUND(@,1)&"/"&ROUND(@,1))`
    e.g. `IF(O22="n/a","-",ROUND(O22,1)&"/ "&ROUND(O28,1))`
- [x3] family: `IF(OR(@=0,@=0),"n/a",IF(@>@,"Ve","Vs"))`
    e.g. `IF(OR(D14=0,D15=0),"n/a",IF(D14>D15,"Ve","Vs"))`
- [x2] family: `IF(@="n/a","n/a",@)`
    e.g. `IF(X14="n/a","n/a",CG8)`
- [x2] family: `IF(@="n/a",0,IF(@>@,100,INDEX(@,@)+(@-INDEX(@,@))*(INDEX(@,@+1)-INDEX(@,@))/(INDEX(@,@+1)-INDEX(@,@))))`
    e.g. `IF(DG5="n/a",0,IF(DG5>DK110,100,INDEX(DA11:DA110,DH5)+(DG5-INDEX(DK11:DK110,DH5))*(INDEX(DA11:DA110,DH5+1)-INDEX(DA11:DA110,DH5))/(INDEX(DK11:DK110,DH5+1)-INDEX(DK11:DK110,DH5))))`
- [x2] family: `IF(AND(@="n/a",@="n/a"),"n/a",@)`
    e.g. `IF(AND(O8="n/a",O12="n/a"),"n/a",DK8)`
- [x2] family: `IF(@=1,@,"n/a")`
    e.g. `IF(AF1=1,BC4,"n/a")`
- [x2] family: `IF(@="n/a","n/a",@-(@/@/@))`
    e.g. `IF(O12="n/a","n/a",R21-(M21/O21/P21))`
- [x1] family: `IF(@<=@,"**Condensationoccurs;exhausttemperaturetobedeterminedbysaturatedenthaply","")`
    e.g. `IF(X22<=J11,"**Condensation occurs; exhaust temperature to be determined by saturated enthaply","")`
- [x1] family: `INDEX(@,@)+(@-INDEX(@,@))*(INDEX(@,@+1)-INDEX(@,@))/(INDEX(@,@+1)-INDEX(@,@))`
    e.g. `INDEX(BH10:BH168,BS7) + (BR7-INDEX(BR10:BR168,BS7)) * (INDEX(BH10:BH168,BS7+1)-INDEX(BH10:BH166,BS7)) / (INDEX(BR10:BR168,BS7+1)-INDEX(BR10:BR168,BS7))`
- [x1] family: `IF(OR(@="n/a",@="n/a",@="n/a)",@="n/a"),"n/a",@*@*@*(@-@))`
    e.g. `IF(OR(X7="n/a",AA7="n/a",AB7="n/a )",AC7="n/a"),"n/a",AC7*X7*Y7*(AA7-AB7))`
- [x1] family: `IF(@*@>0,'SHEET'!@,"-")`
    e.g. `IF(AE13*AG13>0,'Wheel Support'!AH32,"-")`
- [x1] family: `IF(@=1,"n/a",IF(@>0,@,"n/a"))`
    e.g. `IF(AF1=1,"n/a",IF(D19>0,D19,"n/a"))`
- [x1] family: `IF(OR(@="n/a",@="n/a",@="-"),"n/a",ROUNDUP(@-(@/(@*@)),1))`
    e.g. `IF(OR(V30="n/a",X30="n/a",AA30="-"),"n/a",ROUNDUP(AA30-(V30/(X30*Y30)),1))`
- [x1] family: `IF(OR(@="n/a",@="n/a",@="n/a)"),"n/a",@+(@/@/@))`
    e.g. `IF(OR(V13="n/a",X13="n/a",AB13="n/a )"),"n/a",AB13+(V13/X13/Y13))`
- [x1] family: `IF(@<=@,"<"&ROUNDUP(@,1)&"oCdewpointofexhuastair","")`
    e.g. `IF(X22<=J11,"< "&ROUNDUP(J11,1)&"oC dew point of exhuast air","")`
- [x1] family: `IF(OR(@=1,@="n/a",@="n/a"),"n/a",@*@*@*(@-@))`
    e.g. `IF(OR(AF1=1,O7="n/a",T7="n/a"),"n/a",T7*O7*P7*(R7-S7))`
- [x1] family: `IF(@=1,"Supplymoisturecontentunchanged","")`
    e.g. `IF(AF1=1,"Supply moisture content unchanged","")`
- [x1] family: `"Saturatedath="&ROUNDUP(@,1)&"kJ/kg"`
    e.g. `"Saturated at h = "&ROUNDUP(X31,1)&" kJ/kg"`
- [x1] family: `IF(@*@>0,@/@,"-")`
    e.g. `IF(D14*D15>0,D14/D15,"-")`
- [x1] family: `IF(@="n/a","-",IF(@<=@,ROUND(@,1)&"/"&ROUND(@,1),ROUND(@,1)&"/"&ROUND(@,1)))`
    e.g. `IF(X22="n/a","-",IF(X22<=J11,ROUND(X33,1)&"/ "&ROUND(X33,1),ROUND(X22,1)&"/ "&ROUND(X24,1)))`
- [x1] family: `IF(@="n/a","","Exhaustmoisturecontentunchanged")`
    e.g. `IF(X24="n/a","","Exhaust moisture content unchanged")`
- [x1] family: `IF(OR(@<=@,@="n/a"),"n/a",@)`
    e.g. `IF(OR(X22<=J11,X22="n/a"),"n/a",CV8)`
- [x1] family: `IF(@="n/a","",IF(@-@<=0.1,"**Condensationoccursatsupplyoutlet",""))`
    e.g. `IF(O22="n/a","",IF(O22-O28<=0.1,"**Condensation occurs at supply outlet",""))`
- [x1] family: `IF(OR(@="n/a",@="n/a"),"n/a",@-@)`
    e.g. `IF(OR(M15="n/a",O15="n/a"),"n/a",M15-O15)`
- [x1] family: `IF(@<=@,"**Condensationoccursatexhaustoutlet","")`
    e.g. `IF(X22<=J11,"**Condensation occurs at exhaust outlet","")`
- [x1] family: `IF(OR(@="n/a",@="n/a"),"n/a",@*@*@*(@-@))`
    e.g. `IF(OR(T11="n/a",O11="n/a"),"n/a",T11*O11*P11*(R11-S11))`
- [x1] family: `IF(@="n/a","","Supplymoisturecontentunchanged")`
    e.g. `IF(X16="n/a","","Supply moisture content unchanged")`
- [x1] family: `IF(@=1,"Exhaustmoisturecontentunchanged","")`
    e.g. `IF(AF1=1,"Exhaust moisture content unchanged","")`
- [x1] family: `@-40`
    e.g. `D9-40`
- [x1] family: `IF(OR(@="n/a",@="n/a",@="n/a"),"n/a",@/@/@+@)`
    e.g. `IF(OR(M33="n/a",O33="n/a",S33="n/a"),"n/a",M33/O33/P33+S33)`
- [x1] family: `IF(@="-","",IF(@>1.5,"Ratio>1.5-OutofRange",IF(@<0.7,"Ratio<0.7-OutofRange","")))`
    e.g. `IF(D16="-","",IF(D16>1.5,"Ratio > 1.5 - Out of Range",IF(D16<0.7,"Ratio < 0.7 - Out of Range","")))`
- [x1] family: `IF(OR(@=1,@="n/a",@="n/a"),"n/a",@+(@/@/@))`
    e.g. `IF(OR(AF1=1,M37="n/a",O33="n/a"),"n/a",S37+(M37/O37/P37))`
- [x1] family: `IF(@="n/a",0,1)`
    e.g. `IF(O22="n/a",0,1)`
- [x1] family: `IF(OR(@="n/a",@="n/a",@="n/a)"),"n/a",@-(@/@/@))`
    e.g. `IF(OR(V21="n/a",X21="n/a",AA21="n/a )"),"n/a",AA21-(V21/X21/Y21))`
- [x1] family: `IF(@="n/a","",IF(@=@,"<"&ROUNDUP(@,1)&"oCdewpointofsupplyair",""))`
    e.g. `IF(O22="n/a","",IF(O22=O28,"< "&ROUNDUP(J8,1)&"oC dew point of supply air",""))`

---

## Sheet: Wheel Support   (formula cells: 2220 / total 2220)
- [x424] family: ``
    e.g. ``
- [x208] family: `0.62198*(@/(@-@))`
    e.g. `0.62198*(A11/(F2-A11))`
- [x192] family: `((2501-2.381*@)*@-(@-@))/(2501+1.805*@-4.186*@)-@`
    e.g. `((2501-2.381*C38)*F38-(B2-C38))/(2501+1.805*B2-4.186*C38)-A14`
- [x30] family: `Wheel!@`
    e.g. `Wheel!AE4`
- [x16] family: `@`
    e.g. `C38`
- [x16] family: `EXP(-5800.2206/(273.15+@)+1.3914993-0.048640239*(273.15+@)+0.000041764768*POWER((273.15+@),2)-0.000000014452093*POWER((273.15+@),3)+6.5459673*LN(273.15+@))/1000`
    e.g. `EXP(-5800.2206/(273.15+C38)+1.3914993-0.048640239*(273.15+C38)+0.000041764768*POWER((273.15+C38),2)-0.000000014452093*POWER((273.15+C38),3)+6.5459673*LN(273.15+C38))/1000`
- [x8] family: `EXP(@+@)/1000`
    e.g. `EXP(A6+A7)/1000`
- [x8] family: `@/@`
    e.g. `A14/A17`
- [x8] family: `-5800.2206/@+1.3914993-0.048640239*@`
    e.g. `-5800.2206/B5+1.3914993-0.048640239*B5`
- [x8] family: `@-(@-@)*@/(@-@)`
    e.g. `C38-(C38-B38)*H38/(H38-I38)`
- [x8] family: `0.000041764768*POWER(@,2)-0.000000014452093*POWER(@,3)+6.5459673*LN(@)`
    e.g. `0.000041764768*POWER(B5,2)-0.000000014452093*POWER(B5,3)+6.5459673*LN(B5)`
- [x8] family: `6.54+14.526*LN(@)+0.7389*POWER(LN(@),2)+0.09486*POWER(LN(@),3)+0.4569*POWER(@,0.1984)`
    e.g. `6.54+14.526*LN(A11)+0.7389*POWER(LN(A11),2)+0.09486*POWER(LN(A11),3)+0.4569*POWER(A11,0.1984)`
- [x8] family: `273.15+@`
    e.g. `273.15+B2`
- [x8] family: `@/100*@`
    e.g. `B3/100*A8`
- [x8] family: `0.2871*(@+273.15)*(1+1.6078*@)/@`
    e.g. `0.2871*(B2+273.15)*(1+1.6078*A14)/F2`
- [x8] family: `IF(ABS(@-@)<0.00005,@,IF(ABS(@-@)<0.00005,@,IF(ABS(@-@)<0.00005,@,IF(ABS(@-@)<0.00005,@,IF(ABS(@-@)<0.00005,@,IF(ABS(@-@)<0.00005,@,IF(ABS(@-@)<0.00005,@,IF(@-@<0.00005,@))))))))`
    e.g. `IF(ABS(I40-H40)<0.00005,J40,IF(ABS(I41-H41)<0.00005,J41,IF(ABS(I42-H42)<0.00005,J42,IF(ABS(I43-H43)<0.00005,J43,IF(ABS(I44-H44)<0.00005,J44,IF(ABS(I45-H45)<0.00005,J45,IF(ABS(I46-H46)<0.00005,J46,IF(I47-H47<0.00005,J47))))))))`
- [x8] family: `1.006*@+@*(2501+1.805*@)`
    e.g. `1.006*B2+A14*(2501+1.805*B2)`
- [x2] family: `Wheel!@+Wheel!@`
    e.g. `Wheel!DH6+Wheel!DL6`

---

## Sheet: Psychrometric Chart   (formula cells: 331 / total 331)
- [x6] family: `IF(@+@+@+@=0,"-",IF(AND(@<>0,@<>0),'SHEET'!@,IF(AND(@<>0,@<>0),'SHEET'!@,IF(AND(@<>0,@<>0),'SHEET'!@,IF(AND(@<>0,@<>0),'SHEET'!@,IF(AND(@<>0,@<>0),'SHEET'!@,IF(AND(@<>0,@<>0),'SHEET'!@)))))))`
    e.g. `IF(C9+C10+C11+C12=0,"-",IF(AND(C9<>0,C10<>0),'Supporting 1'!A27,IF(AND(C9<>0,C11<>0),'Supporting 2'!A24,IF(AND(C9<>0,C12<>0),'Supporting 3'!A19,IF(AND(C10<>0,C12<>0),'Supporting 4'!A16,IF(AND(C10<>0,C11<>0),'Supproting 5'!A21,IF(AND(C11<>0,C12<>0),'Supporting 6'!A13)))))))`
- [x4] family: `IF(@+@+@+@=0,"-",IF(@<>0,@,IF(AND(@<>0,@<>0),'SHEET'!@,IF(AND(@<>0,@<>0),'SHEET'!@,IF(AND(@<>0,@<>0),'SHEET'!@)))))`
    e.g. `IF(C9+C10+C11+C12=0,"-",IF(C9<>0,C9,IF(AND(C10<>0,C12<>0),'Supporting 4'!A10,IF(AND(C10<>0,C11<>0),'Supproting 5'!A18,IF(AND(C11<>0,C12<>0),'Supporting 6'!A10)))))`
- [x2] family: `IF(@+@+@+@=0,"-",IF(AND(@<>0,@>@,@<>0),"ERROR",IF(@<>0,@,IF(AND(@<>0,@<>0),'SHEET'!@,IF(AND(@<>0,@<>0),'SHEET'!@,IF(AND(@<>0,@<>0),'SHEET'!@))))))`
    e.g. `IF(C9+C10+C11+C12=0,"-",IF(AND(C10<>0,C10>C9,C9<>0),"ERROR",IF(C10<>0,C10,IF(AND(C9<>0,C11<>0),'Supporting 2'!A30,IF(AND(C9<>0,C12<>0),'Supporting 3'!A28,IF(AND(C11<>0,C12<>0),'Supporting 6'!A19))))))`
- [x2] family: `IF(@+@+@+@=0,"-",IF(@<>0,@,IF(AND(@<>0,@<>0),'SHEET'!@,IF(AND(@<>0,@<>0),@,IF(AND(@<>0,@<>0),'SHEET'!@,IF(AND(@<>0,@<>0),'SHEET'!@))))))`
    e.g. `IF(C9+C10+C11+C12=0,"-",IF(C11<>0,C11,IF(AND(C9<>0,C10<>0),'Supporting 1'!A36,IF(AND(C9<>0,C11<>0),C11,IF(AND(C9<>0,C12<>0),'Supporting 3'!A25,IF(AND(C10<>0,C12<>0),'Supporting 4'!A25))))))`
- [x2] family: `IF(@+@+@+@=0,"-",1/@)`
    e.g. `IF(C9+C10+C11+C12=0,"-",1/C19)`

---

## Sheet: Supporting 1   (formula cells: 56 / total 56)
- [x4] family: `0.000041764768*POWER(@,2)-0.000000014452093*POWER(@,3)+6.5459673*LN(@)`
    e.g. `0.000041764768*POWER(B1,2)-0.000000014452093*POWER(B1,3)+6.5459673*LN(B1)`
- [x4] family: `0.62198*(@/('SHEET'!@-@))`
    e.g. `0.62198*(A4/('Psychrometric Chart'!$C$6-A4))`
- [x4] family: `EXP(@+@)/1000`
    e.g. `EXP(A2+A3)/1000`
- [x4] family: `273.15+'SHEET'!@`
    e.g. `273.15+'Psychrometric Chart'!C10`
- [x4] family: `-5800.2206/@+1.3914993-0.048640239*@`
    e.g. `-5800.2206/B1+1.3914993-0.048640239*B1`
- [x2] family: `1.006*'SHEET'!@+@*(2501+1.805*'SHEET'!@)`
    e.g. `1.006*'Psychrometric Chart'!C9+A10*(2501+1.805*'Psychrometric Chart'!C9)`
- [x2] family: `6.54+14.526*LN(@)+0.7389*POWER(LN(@),2)+0.09486*POWER(LN(@),3)+0.4569*POWER(@,0.1984)`
    e.g. `6.54+14.526*LN(A33)+0.7389*POWER(LN(A33),2)+0.09486*POWER(LN(A33),3)+0.4569*POWER(A33,0.1984)`
- [x2] family: `@/(1-(1-@)*(@/'SHEET'!@))*100`
    e.g. `A21/(1-(1-A21)*(A15/'Psychrometric Chart'!$C$6))*100`
- [x2] family: `@/@`
    e.g. `A10/A18`
- [x2] family: `(0.2871*('SHEET'!@+273.15)*(1+1.6078*@))/'SHEET'!@`
    e.g. `(0.2871*('Psychrometric Chart'!C9+273.15)*(1+1.6078*A10))/'Psychrometric Chart'!$C$6`
- [x2] family: `((2501-2.381*'SHEET'!@)*@-('SHEET'!@-'SHEET'!@))/(2501+1.805*'SHEET'!@-4.186*'SHEET'!@)`
    e.g. `((2501-2.381*'Psychrometric Chart'!C10)*A7-('Psychrometric Chart'!C9-'Psychrometric Chart'!C10))/(2501+1.805*'Psychrometric Chart'!C9-4.186*'Psychrometric Chart'!C10)`
- [x2] family: `'SHEET'!@*@/(0.62198+@)`
    e.g. `'Psychrometric Chart'!$C$6*A10/(0.62198+A10)`

---

## Sheet: Supporting 2   (formula cells: 50 / total 50)
- [x4] family: `0.62198*(@/('SHEET'!@-@))`
    e.g. `0.62198*(A4/('Psychrometric Chart'!$C$6-A4))`
- [x4] family: `273.15+'SHEET'!@`
    e.g. `273.15+'Psychrometric Chart'!C11`
- [x4] family: `EXP(@+@)/1000`
    e.g. `EXP(A2+A3)/1000`
- [x4] family: `-5800.2206/@+1.3914993-0.048640239*@`
    e.g. `-5800.2206/B1+1.3914993-0.048640239*B1`
- [x4] family: `0.000041764768*POWER(@,2)-0.000000014452093*POWER(@,3)+6.5459673*LN(@)`
    e.g. `0.000041764768*POWER(B1,2)-0.000000014452093*POWER(B1,3)+6.5459673*LN(B1)`
- [x2] family: `@/(1-(1-@)*(@/'SHEET'!@))*100`
    e.g. `A18/(1-(1-A18)*(A12/'Psychrometric Chart'!$C$6))*100`
- [x2] family: `IF('SHEET'!@=0,'SHEET'!@,IF(ABS('SHEET'!@-'SHEET'!@)<0.00005,'SHEET'!@,IF(ABS('SHEET'!@-'SHEET'!@)<0.00005,'SHEET'!@,IF(ABS('SHEET'!@-'SHEET'!@)<0.00005,'SHEET'!@,IF(ABS('SHEET'!@-'SHEET'!@)<0.00005,'SHEET'!@,IF(ABS('SHEET'!@-'SHEET'!@)<0.00005,'SHEET'!@,IF(ABS('SHEET'!@-'SHEET'!@)<0.00005,'SHEET'!@,IF('SHEET'!@-'SHEET'!@<0.000005,'SHEET'!@))))))))`
    e.g. `IF('Supporting 2.1'!$H13=0,'Supporting 2.1'!$J13,IF(ABS('Supporting 2.1'!$I14-'Supporting 2.1'!$H14)<0.00005,'Supporting 2.1'!$J14,IF(ABS('Supporting 2.1'!$I15-'Supporting 2.1'!$H15)<0.00005,'Supporting 2.1'!$J15,IF(ABS('Supporting 2.1'!$I16-'Supporting 2.1'!$H16)<0.00005,'Supporting 2.1'!$J16,IF(ABS('Supporting 2.1'!$I17-'Supporting 2.1'!$H17)<0.00005,'Supporting 2.1'!$J17,IF(ABS('Supporting 2.1'!$I18-'Supporting 2.1'!$H18)<0.00005,'Supporting 2.1'!$J18,IF(ABS('Supporting 2.1'!$I19-'Supporting 2.1'!$H19)<0.00005,'Supporting 2.1'!$J19,IF('Supporting 2.1'!$I20-'Supporting 2.1'!$H20<0.000005,'Supporting 2.1'!$J20))))))))`
- [x2] family: `0.2871*('SHEET'!@+273.15)*(1+1.6078*@)/'SHEET'!@`
    e.g. `0.2871*('Psychrometric Chart'!C9+273.15)*(1+1.6078*A7)/'Psychrometric Chart'!$C$6`
- [x2] family: `@/@`
    e.g. `A7/A15`
- [x2] family: `1.006*'SHEET'!@+@*(2501+1.805*'SHEET'!@)`
    e.g. `1.006*'Psychrometric Chart'!C9+A7*(2501+1.805*'Psychrometric Chart'!C9)`

---

## Sheet: Supporting 2.1   (formula cells: 271 / total 271)
- [x106] family: ``
    e.g. ``
- [x48] family: `0.62198*(@/('SHEET'!@-@))`
    e.g. `0.62198*(D13/('Psychrometric Chart'!$C$6-D13))`
- [x48] family: `((2501-2.381*@)*@-('SHEET'!@-@))/(2501+1.805*'SHEET'!@-4.186*@)-'SHEET'!@`
    e.g. `((2501-2.381*C13)*F13-('Psychrometric Chart'!C9-C13))/(2501+1.805*'Psychrometric Chart'!C9-4.186*C13)-'Supporting 2'!A7`
- [x4] family: `EXP(-5800.2206/(273.15+@)+1.3914993-0.048640239*(273.15+@)+0.000041764768*POWER((273.15+@),2)-0.000000014452093*POWER((273.15+@),3)+6.5459673*LN(273.15+@))/1000`
    e.g. `EXP(-5800.2206/(273.15+C13)+1.3914993-0.048640239*(273.15+C13)+0.000041764768*POWER((273.15+C13),2)-0.000000014452093*POWER((273.15+C13),3)+6.5459673*LN(273.15+C13))/1000`
- [x4] family: `@`
    e.g. `C13`
- [x2] family: `@-(@-@)*@/(@-@)`
    e.g. `C13-(C13-B13)*H13/(H13-I13)`

---

## Sheet: Supporting 3   (formula cells: 42 / total 42)
- [x4] family: `0.62198*(@/('SHEET'!@-@))`
    e.g. `0.62198*(A7/('Psychrometric Chart'!$C$6-A7))`
- [x2] family: `1.006*'SHEET'!@+@*(2501+1.805*'SHEET'!@)`
    e.g. `1.006*'Psychrometric Chart'!C9+A10*(2501+1.805*'Psychrometric Chart'!C9)`
- [x2] family: `'SHEET'!@/100*@`
    e.g. `'Psychrometric Chart'!C12/100*A4`
- [x2] family: `EXP(@+@)/1000`
    e.g. `EXP(A2+A3)/1000`
- [x2] family: `-5800.2206/@+1.3914993-0.048640239*@`
    e.g. `-5800.2206/B1+1.3914993-0.048640239*B1`
- [x2] family: `6.54+14.526*LN(@)+0.7389*POWER(LN(@),2)+0.09486*POWER(LN(@),3)+0.4569*POWER(@,0.1984)`
    e.g. `6.54+14.526*LN(A7)+0.7389*POWER(LN(A7),2)+0.09486*POWER(LN(A7),3)+0.4569*POWER(A7,0.1984)`
- [x2] family: `IF(ABS('SHEET'!@-'SHEET'!@)<0.00005,'SHEET'!@,IF(ABS('SHEET'!@-'SHEET'!@)<0.00005,'SHEET'!@,IF(ABS('SHEET'!@-'SHEET'!@)<0.00005,'SHEET'!@,IF(ABS('SHEET'!@-'SHEET'!@)<0.00005,'SHEET'!@,IF(ABS('SHEET'!@-'SHEET'!@)<0.00005,'SHEET'!@,IF(ABS('SHEET'!@-'SHEET'!@)<0.00005,'SHEET'!@,IF(ABS('SHEET'!@-'SHEET'!@)<0.00005,'SHEET'!@,IF('SHEET'!@-'SHEET'!@<0.00005,'SHEET'!@))))))))`
    e.g. `IF(ABS('Supporting 3.1'!$I15-'Supporting 3.1'!$H15)<0.00005,'Supporting 3.1'!$J15,IF(ABS('Supporting 3.1'!$I16-'Supporting 3.1'!$H16)<0.00005,'Supporting 3.1'!$J16,IF(ABS('Supporting 3.1'!$I17-'Supporting 3.1'!$H17)<0.00005,'Supporting 3.1'!$J17,IF(ABS('Supporting 3.1'!$I18-'Supporting 3.1'!$H18)<0.00005,'Supporting 3.1'!$J18,IF(ABS('Supporting 3.1'!$I19-'Supporting 3.1'!$H19)<0.00005,'Supporting 3.1'!$J19,IF(ABS('Supporting 3.1'!$I20-'Supporting 3.1'!$H20)<0.00005,'Supporting 3.1'!$J20,IF(ABS('Supporting 3.1'!$I21-'Supporting 3.1'!$H21)<0.00005,'Supporting 3.1'!$J21,IF('Supporting 3.1'!$I22-'Supporting 3.1'!$H22<0.00005,'Supporting 3.1'!$J22))))))))`
- [x2] family: `@/@`
    e.g. `A10/A13`
- [x2] family: `0.2871*('SHEET'!@+273.15)*(1+1.6078*@)/'SHEET'!@`
    e.g. `0.2871*('Psychrometric Chart'!C9+273.15)*(1+1.6078*A10)/'Psychrometric Chart'!$C$6`
- [x2] family: `273.15+'SHEET'!@`
    e.g. `273.15+'Psychrometric Chart'!C9`
- [x2] family: `0.000041764768*POWER(@,2)-0.000000014452093*POWER(@,3)+6.5459673*LN(@)`
    e.g. `0.000041764768*POWER(B1,2)-0.000000014452093*POWER(B1,3)+6.5459673*LN(B1)`

---

## Sheet: Supporting 3.1   (formula cells: 271 / total 271)
- [x106] family: ``
    e.g. ``
- [x48] family: `0.62198*(@/('SHEET'!@-@))`
    e.g. `0.62198*(D13/('Psychrometric Chart'!$C$6-D13))`
- [x48] family: `((2501-2.381*@)*@-('SHEET'!@-@))/(2501+1.805*'SHEET'!@-4.186*@)-'SHEET'!@`
    e.g. `((2501-2.381*C13)*F13-('Psychrometric Chart'!$C$9-C13))/(2501+1.805*'Psychrometric Chart'!$C$9-4.186*C13)-'Supporting 3'!$A$10`
- [x4] family: `EXP(-5800.2206/(273.15+@)+1.3914993-0.048640239*(273.15+@)+0.000041764768*POWER((273.15+@),2)-0.000000014452093*POWER((273.15+@),3)+6.5459673*LN(273.15+@))/1000`
    e.g. `EXP(-5800.2206/(273.15+C13)+1.3914993-0.048640239*(273.15+C13)+0.000041764768*POWER((273.15+C13),2)-0.000000014452093*POWER((273.15+C13),3)+6.5459673*LN(273.15+C13))/1000`
- [x4] family: `@`
    e.g. `C13`
- [x2] family: `@-(@-@)*@/(@-@)`
    e.g. `C13-(C13-B13)*H13/(H13-I13)`

---

## Sheet: Supporting 4   (formula cells: 39 / total 39)
- [x2] family: `(0.2871*(@+273.15)*(1+1.6078*@))/'SHEET'!@`
    e.g. `(0.2871*(A10+273.15)*(1+1.6078*A13))/'Psychrometric Chart'!$C$6`
- [x2] family: `0.62198*@/('SHEET'!@-@)`
    e.g. `0.62198*A4/('Psychrometric Chart'!$C$6-A4)`
- [x2] family: `EXP(@+@)/1000`
    e.g. `EXP(A2+A3)/1000`
- [x2] family: `'SHEET'!@*@/(0.62198+@)`
    e.g. `'Psychrometric Chart'!$C$6*A13/(0.62198+A13)`
- [x2] family: `1.006*@+@*(2501+1.805*@)`
    e.g. `1.006*A10+A13*(2501+1.805*A10)`
- [x2] family: `273.15+'SHEET'!@`
    e.g. `273.15+'Psychrometric Chart'!C10`
- [x2] family: `((2501-2.381*'SHEET'!@)*@-(@-'SHEET'!@))/(2501+1.805*@-4.186*'SHEET'!@)`
    e.g. `((2501-2.381*'Psychrometric Chart'!C10)*A7-(A10-'Psychrometric Chart'!C10))/(2501+1.805*A10-4.186*'Psychrometric Chart'!C10)`
- [x2] family: `6.54+14.526*LN(@)+0.7389*POWER(LN(@),2)+0.09486*POWER(LN(@),3)+0.4569*POWER(@,0.1984)`
    e.g. `6.54+14.526*LN(A22)+0.7389*POWER(LN(A22),2)+0.09486*POWER(LN(A22),3)+0.4569*POWER(A22,0.1984)`
- [x2] family: `-5800.2206/@+1.3914993-0.048640239*@`
    e.g. `-5800.2206/B1+1.3914993-0.048640239*B1`
- [x2] family: `IF('SHEET'!@=0,'SHEET'!@,IF(ABS('SHEET'!@-'SHEET'!@)<0.00005,'SHEET'!@,IF(ABS('SHEET'!@-'SHEET'!@)<0.00005,'SHEET'!@,IF(ABS('SHEET'!@-'SHEET'!@)<0.00005,'SHEET'!@,IF(ABS('SHEET'!@-'SHEET'!@)<0.00005,'SHEET'!@,IF(ABS('SHEET'!@-'SHEET'!@)<0.00005,'SHEET'!@,IF(ABS('SHEET'!@-'SHEET'!@)<0.005,'SHEET'!@)))))))`
    e.g. `IF('Supporting 4.1'!$H23=0,'Supporting 4.1'!$J22,IF(ABS('Supporting 4.1'!$I26-'Supporting 4.1'!$H26)<0.00005,'Supporting 4.1'!$J26,IF(ABS('Supporting 4.1'!$I27-'Supporting 4.1'!$H27)<0.00005,'Supporting 4.1'!$J27,IF(ABS('Supporting 4.1'!$I28-'Supporting 4.1'!$H28)<0.00005,'Supporting 4.1'!$J28,IF(ABS('Supporting 4.1'!$I29-'Supporting 4.1'!$H29)<0.00005,'Supporting 4.1'!$J29,IF(ABS('Supporting 4.1'!$I30-'Supporting 4.1'!$H30)<0.00005,'Supporting 4.1'!$J30,IF(ABS('Supporting 4.1'!$I31-'Supporting 4.1'!$H31)<0.005,'Supporting 4.1'!$J31)))))))`
- [x2] family: `0.000041764768*POWER(@,2)-0.000000014452093*POWER(@,3)+6.5459673*LN(@)`
    e.g. `0.000041764768*POWER(B1,2)-0.000000014452093*POWER(B1,3)+6.5459673*LN(B1)`
- [x1] family: `IF('SHEET'!@-'SHEET'!@<0.0000000005,'SHEET'!@)`
    e.g. `IF('Supporting 4.1'!$I30-'Supporting 4.1'!$H30<0.0000000005,'Supporting 4.1'!$J30)`

---

## Sheet: Supporting 4.1   (formula cells: 279 / total 279)
- [x106] family: ``
    e.g. ``
- [x48] family: `'SHEET'!@*@/100`
    e.g. `'Psychrometric Chart'!$C$12*D22/100`
- [x48] family: `((2501-2.381*'SHEET'!@)*'SHEET'!@-(@-'SHEET'!@))/(2501+1.805*@-4.186*'SHEET'!@)-0.62198*@/('SHEET'!@-@)`
    e.g. `((2501-2.381*'Psychrometric Chart'!$C$10)*'Supporting 4'!$A$7-(C22-'Psychrometric Chart'!$C$10))/(2501+1.805*C22-4.186*'Psychrometric Chart'!$C$10)-0.62198*F22/('Psychrometric Chart'!$C$6-F22)`
- [x4] family: `EXP(-5800.2206/(273.15+@)+1.3914993-0.048640239*(273.15+@)+0.000041764768*POWER((273.15+@),2)-0.000000014452093*POWER((273.15+@),3)+6.5459673*LN(273.15+@))/1000`
    e.g. `EXP(-5800.2206/(273.15+C22)+1.3914993-0.048640239*(273.15+C22)+0.000041764768*POWER((273.15+C22),2)-0.000000014452093*POWER((273.15+C22),3)+6.5459673*LN(273.15+C22))/1000`
- [x4] family: `@`
    e.g. `C22`
- [x2] family: `@-(@-@)*@/(@-@)`
    e.g. `C22-(C22-B22)*H22/(H22-I22)`

---

## Sheet: Supproting 5   (formula cells: 66 / total 66)
- [x6] family: `0.000041764768*POWER(@,2)-0.000000014452093*POWER(@,3)+6.5459673*LN(@)`
    e.g. `0.000041764768*POWER(B1,2)-0.000000014452093*POWER(B1,3)+6.5459673*LN(B1)`
- [x6] family: `-5800.2206/@+1.3914993-0.048640239*@`
    e.g. `-5800.2206/B1+1.3914993-0.048640239*B1`
- [x6] family: `EXP(@+@)/1000`
    e.g. `EXP(A2+A3)/1000`
- [x4] family: `0.62198*@/('SHEET'!@-@)`
    e.g. `0.62198*A4/('Psychrometric Chart'!$C$6-A4)`
- [x4] family: `273.15+'SHEET'!@`
    e.g. `273.15+'Psychrometric Chart'!C10`
- [x2] family: `1.006*@+@*(2501+1.805*@)`
    e.g. `1.006*A18+A15*(2501+1.805*A18)`
- [x2] family: `(0.2871*(@+273.15)*(1+1.6078*@))/'SHEET'!@`
    e.g. `(0.2871*(A18+273.15)*(1+1.6078*A15))/'Psychrometric Chart'!$C$6`
- [x2] family: `273.15+@`
    e.g. `273.15+A18`
- [x2] family: `IF('SHEET'!@=0,'SHEET'!@,IF(ABS('SHEET'!@-'SHEET'!@)<0.00005,'SHEET'!@,IF(ABS('SHEET'!@-'SHEET'!@)<0.00005,'SHEET'!@,IF(ABS('SHEET'!@-'SHEET'!@)<0.00005,'SHEET'!@,IF(ABS('SHEET'!@-'SHEET'!@)<0.00005,'SHEET'!@,IF(ABS('SHEET'!@-'SHEET'!@)<0.00005,'SHEET'!@,IF(ABS('SHEET'!@-'SHEET'!@)<0.00005,'SHEET'!@,IF('SHEET'!@-'SHEET'!@<0.00005,'SHEET'!@))))))))`
    e.g. `IF('Supporting 5.1'!$D10=0,'Supporting 5.1'!$F10,IF(ABS('Supporting 5.1'!$E11-'Supporting 5.1'!$D11)<0.00005,'Supporting 5.1'!$F11,IF(ABS('Supporting 5.1'!$E12-'Supporting 5.1'!$D12)<0.00005,'Supporting 5.1'!$F12,IF(ABS('Supporting 5.1'!$E13-'Supporting 5.1'!$D13)<0.00005,'Supporting 5.1'!$F13,IF(ABS('Supporting 5.1'!$E14-'Supporting 5.1'!$D14)<0.00005,'Supporting 5.1'!$F14,IF(ABS('Supporting 5.1'!$E15-'Supporting 5.1'!$D15)<0.00005,'Supporting 5.1'!$F15,IF(ABS('Supporting 5.1'!$E16-'Supporting 5.1'!$D16)<0.00005,'Supporting 5.1'!$F16,IF('Supporting 5.1'!$E17-'Supporting 5.1'!$D17<0.00005,'Supporting 5.1'!$F17))))))))`
- [x2] family: `@/@`
    e.g. `A15/A32`
- [x2] family: `@/(1-(1-@)*(@/'SHEET'!@))*100`
    e.g. `A35/(1-(1-A35)*(A29/'Psychrometric Chart'!$C$6))*100`
- [x2] family: `0.62198*(@/('SHEET'!@-@))`
    e.g. `0.62198*(A29/('Psychrometric Chart'!$C$6-A29))`

---

## Sheet: Supporting 5.1   (formula cells: 180 / total 180)
- [x62] family: ``
    e.g. ``
- [x48] family: `((2501-2.381*'SHEET'!@)*'SHEET'!@-(@-'SHEET'!@))/(2501+1.805*@-4.186*'SHEET'!@)-'SHEET'!@`
    e.g. `((2501-2.381*'Psychrometric Chart'!$C$10)*'Supproting 5'!$A$7-(C10-'Psychrometric Chart'!$C$10))/(2501+1.805*C10-4.186*'Psychrometric Chart'!$C$10)-'Supproting 5'!$A$15`
- [x4] family: `@`
    e.g. `C10`
- [x2] family: `@-(@-@)*@/(@-@)`
    e.g. `C10-(C10-B10)*D10/(D10-E10)`

---

## Sheet: Supporting 6   (formula cells: 32 / total 32)
- [x2] family: `EXP(@+@)/1000`
    e.g. `EXP(A2+A3)/1000`
- [x2] family: `IF(ABS('SHEET'!@-'SHEET'!@)<0.000005,'SHEET'!@,IF(ABS('SHEET'!@-'SHEET'!@)<0.000005,'SHEET'!@,IF(ABS('SHEET'!@-'SHEET'!@)<0.000005,'SHEET'!@,IF(ABS('SHEET'!@-'SHEET'!@)<0.000005,'SHEET'!@,IF(ABS('SHEET'!@-'SHEET'!@)<0.000005,'SHEET'!@,IF(ABS('SHEET'!@-'SHEET'!@)<0.000005,'SHEET'!@,IF(ABS('SHEET'!@-'SHEET'!@)<0.000005,'SHEET'!@)))))))`
    e.g. `IF(ABS('Supporting 6.1'!$I21-'Supporting 6.1'!$H21)<0.000005,'Supporting 6.1'!$J21,IF(ABS('Supporting 6.1'!$I22-'Supporting 6.1'!$H22)<0.000005,'Supporting 6.1'!$J22,IF(ABS('Supporting 6.1'!$I23-'Supporting 6.1'!$H23)<0.000005,'Supporting 6.1'!$J23,IF(ABS('Supporting 6.1'!$I24-'Supporting 6.1'!$H24)<0.000005,'Supporting 6.1'!$J24,IF(ABS('Supporting 6.1'!$I25-'Supporting 6.1'!$H25)<0.000005,'Supporting 6.1'!$J25,IF(ABS('Supporting 6.1'!$I26-'Supporting 6.1'!$H26)<0.000005,'Supporting 6.1'!$J26,IF(ABS('Supporting 6.1'!$I27-'Supporting 6.1'!$H27)<0.000005,'Supporting 6.1'!$J27)))))))`
- [x2] family: `0.62198*(@/('SHEET'!@-@))`
    e.g. `0.62198*(A4/('Psychrometric Chart'!$C$6-A4))`
- [x2] family: `1.006*@+@*(2501+1.805*@)`
    e.g. `1.006*A10+A7*(2501+1.805*A10)`
- [x2] family: `273.15+'SHEET'!@`
    e.g. `273.15+'Psychrometric Chart'!C11`
- [x2] family: `-5800.2206/@+1.3914993-0.048640239*@`
    e.g. `-5800.2206/B1+1.3914993-0.048640239*B1`
- [x2] family: `IF('SHEET'!@=0,'SHEET'!@,IF(ABS('SHEET'!@-'SHEET'!@)<0.00005,'SHEET'!@,IF(ABS('SHEET'!@-'SHEET'!@)<0.00005,'SHEET'!@,IF(ABS('SHEET'!@-'SHEET'!@)<0.00005,'SHEET'!@,IF(ABS('SHEET'!@-'SHEET'!@)<0.00005,'SHEET'!@,IF(ABS('SHEET'!@-'SHEET'!@)<0.05,'SHEET'!@,IF(ABS('SHEET'!@-'SHEET'!@)<0.05,'SHEET'!@)))))))`
    e.g. `IF('Supporting 6.1'!$H41=0,'Supporting 6.1'!$J44,IF(ABS('Supporting 6.1'!$I45-'Supporting 6.1'!$H45)<0.00005,'Supporting 6.1'!$J45,IF(ABS('Supporting 6.1'!$I46-'Supporting 6.1'!$H46)<0.00005,'Supporting 6.1'!$J46,IF(ABS('Supporting 6.1'!$I47-'Supporting 6.1'!$H47)<0.00005,'Supporting 6.1'!$J47,IF(ABS('Supporting 6.1'!$I48-'Supporting 6.1'!$H48)<0.00005,'Supporting 6.1'!$J48,IF(ABS('Supporting 6.1'!$I49-'Supporting 6.1'!$H49)<0.05,'Supporting 6.1'!$J49,IF(ABS('Supporting 6.1'!$I50-'Supporting 6.1'!$H50)<0.05,'Supporting 6.1'!$J50)))))))`
- [x2] family: `0.000041764768*POWER(@,2)-0.000000014452093*POWER(@,3)+6.5459673*LN(@)`
    e.g. `0.000041764768*POWER(B1,2)-0.000000014452093*POWER(B1,3)+6.5459673*LN(B1)`
- [x2] family: `(0.2871*(@+273.15)*(1+1.6078*@))/'SHEET'!@`
    e.g. `(0.2871*(A10+273.15)*(1+1.6078*A7))/'Psychrometric Chart'!$C$6`

---

## Sheet: Supporting 6.1   (formula cells: 559 / total 559)
- [x212] family: ``
    e.g. ``
- [x48] family: `0.62198*(@/('SHEET'!@-@))`
    e.g. `0.62198*(D41/('Psychrometric Chart'!$C$6-D41))`
- [x48] family: `@/(1-(1-@)*(@/'SHEET'!@))-('SHEET'!@/100)`
    e.g. `F16/(1-(1-F16)*(D16/'Psychrometric Chart'!$C$6))-('Psychrometric Chart'!$C$12/100)`
- [x48] family: `'SHEET'!@/(0.62198*@/('SHEET'!@-@))`
    e.g. `'Supporting 6'!$A$7/(0.62198*D16/('Psychrometric Chart'!$C$6-D16))`
- [x48] family: `((2501-2.381*@)*@-('SHEET'!@-@))/(2501+1.805*'SHEET'!@-4.186*@)-'SHEET'!@`
    e.g. `((2501-2.381*C41)*F41-('Supporting 6'!$A$10-C41))/(2501+1.805*'Supporting 6'!$A$10-4.186*C41)-'Supporting 6'!$A$7`
- [x8] family: `EXP(-5800.2206/(273.15+@)+1.3914993-0.048640239*(273.15+@)+0.000041764768*POWER((273.15+@),2)-0.000000014452093*POWER((273.15+@),3)+6.5459673*LN(273.15+@))/1000`
    e.g. `EXP(-5800.2206/(273.15+C16)+1.3914993-0.048640239*(273.15+C16)+0.000041764768*POWER((273.15+C16),2)-0.000000014452093*POWER((273.15+C16),3)+6.5459673*LN(273.15+C16))/1000`
- [x8] family: `@`
    e.g. `C16`
- [x4] family: `@-(@-@)*@/(@-@)`
    e.g. `C16-(C16-B16)*H16/(H16-I16)`

---

## Sheet: Pipe Sizing   (formula cells: 21797 / total 21797)
- [x2027] family: ``
    e.g. ``
- [x53] family: `IF(@=@,@,0)`
    e.g. `IF($BR$10=EC27,EE27,0)`
- [x37] family: `@`
    e.g. `G15`
- [x17] family: `IF(@=@,@,"")`
    e.g. `IF($CH$9=BW12,$CH$11,"")`
- [x14] family: `IF(AND(@>0,@>0),@,"")`
    e.g. `IF(AND($CI33>0,$CK33>0),CM33,"")`
- [x14] family: `IF(AND(@*@>0,@=@),@,"")`
    e.g. `IF(AND($CI33*$CK33>0,CM33=$CK$8),$CH$11,"")`
- [x14] family: `SUM(@)*1000`
    e.g. `SUM(CJ106:CJ122)*1000`
- [x10] family: `IF(@>@,"",@)`
    e.g. `IF($E$21>AL7,"",AL7)`
- [x3] family: `(VLOOKUP(@,@,3,FALSE))`
    e.g. `(VLOOKUP(AJ43,$I$7:$K$39,3,FALSE))`
- [x3] family: `IF(@=0,"-",IF(@>0,"-",@))`
    e.g. `IF(E19=0,"-",IF(E24>0,"-",AK42))`
- [x3] family: `IF(@="x","",VLOOKUP(MIN(@),@,2,FALSE))`
    e.g. `IF(AK41="x","",VLOOKUP(MIN(AJ7:AJ39),AJ7:AK39,2,FALSE))`
- [x3] family: `IF(OR(@=@,@=@),"►","")`
    e.g. `IF(OR($AJ$43=I7,$AR$43=I7),"►","")`
- [x3] family: `IF(@=0,"x","ok")`
    e.g. `IF($E$19=0,"x","ok")`
- [x3] family: `IF(@>0,@,@)`
    e.g. `IF(E24>0,E24,AK42)`
- [x3] family: `IF(@=0,"-",(@/1000)/(((@/1000/2)^2)*PI()))`
    e.g. `IF(E19=0,"-",(E21/1000)/(((AK43/1000/2)^2)*PI()))`
- [x3] family: `IF(@=0,"-",ROUND(6.819*(@/@)^1.852/(@/1000)^1.167*1000*9.81,0))`
    e.g. `IF(E19=0,"-",ROUND(6.819*(E25/$E$7)^1.852/(AK43/1000)^1.167*1000*9.81,0))`
- [x2] family: `@*4.186789*@`
    e.g. `M7*4.186789*$Q$4`
- [x2] family: `@/3.517`
    e.g. `R7/3.517`
- [x2] family: `@-@`
    e.g. `F15-E15`
- [x2] family: `IF(@=@,1,2)`
    e.g. `IF(BS7=CL13,1,2)`
- [x2] family: `IF(@>0,@+@+120,0)`
    e.g. `IF(BC8>0,BB7+BB8+120,0)`
- [x2] family: `IF(@="x","-",@*4.185*@)`
    e.g. `IF(AS41="x","-",$AG$48*4.185*G41)`
- [x2] family: `IF(@=0,"-",@*3.6)`
    e.g. `IF(E19=0,"-",E21*3.6)`
- [x2] family: `SUM(@)`
    e.g. `SUM(DN33:DN68)`
- [x2] family: `IF(@=0,"-",@/4.185/@)`
    e.g. `IF($E$19=0,"-",AE47/4.185/G21)`
- [x2] family: `IF(AND(@>0,@>0,@>0),@,"n/a")`
    e.g. `IF(AND(BR7>0,BR10>0,BR17>0),CH9,"n/a")`
- [x2] family: `ROUND(6.819*(@/@)^1.852/(@/1000)^1.167*1000*9.81,0)`
    e.g. `ROUND(6.819*(O7/$E$7)^1.852/(K7/1000)^1.167*1000*9.81,0)`
- [x2] family: `@&@`
    e.g. `BD7 & BE7`
- [x2] family: `IF(@="x","-",@/3.516)`
    e.g. `IF(AS41="x","-",E41/3.516)`
- [x2] family: `(IF(@=0,@,@)/1000/9.81*(@/1000)^1.167/6.819)^(1/1.852)*@`
    e.g. `(IF($AD7=0,AF$5,$AD7)/1000/9.81*($K7/1000)^1.167/6.819)^(1/1.852)*$E$7`
- [x2] family: `IF(@=0,"-",IF(@=@,@,@))`
    e.g. `IF($E$19=0,"-",IF(F19=AF47,AE48,AE47))`
- [x1] family: `IF(@=1,140,100)`
    e.g. `IF(AF52=1,140,100)`
- [x1] family: `MATCH(@,@)`
    e.g. `MATCH(ED59,ED62:ED82)`
- [x1] family: `@/1000/9.81*100`
    e.g. `AF5/1000/9.81*100`
- [x1] family: `IF(@>0,IF(@=@,VLOOKUP(@,@,2,FALSE),IF(@=@,VLOOKUP(@,@,4,FALSE))),"---")`
    e.g. `IF(BR5>0,IF(BR5=CJ4,VLOOKUP(CH4,CI5:CK6,2,FALSE),IF(BR5=CL4,VLOOKUP(CH4,CI5:CM6,4,FALSE))),"---")`
- [x1] family: `IF(@>0,@+120,0)`
    e.g. `IF(BC7>0,BB7+120,0)`
- [x1] family: `IF(@>0,9,0)`
    e.g. `IF(BB15>0,9,0)`
- [x1] family: `IF(@=1,@/(@-@)*3600,@)`
    e.g. `IF(CH4=1,BR7/(BR11-BR15)*3600,BR7)`
- [x1] family: `IF(@<=@,IF(@<=IF(@=0,@,@),@,(@/1000/9.81*(@/1000)^1.167/6.819)^(1/1.852)*@),IF(@<=IF(@=0,@,@),@,"Check"))`
    e.g. `IF(AG7<=AF$5,IF(AF7<=IF($AE7=0,AG$5,$AE7),AF7,(AG7/1000/9.81*($K7/1000)^1.167/6.819)^(1/1.852)*$E$7),IF(AF7<=IF($AE7=0,AG$5,$AE7),AF7,"Check"))`
- [x1] family: `IF(@=@,@*3.6,@)`
    e.g. `IF(F35=AH48,E35*3.6,E35)`
- [x1] family: `IF(COUNTA(@)>0,@,"-")`
    e.g. `IF(COUNTA(BR10)>0,EF60,"-")`
- [x1] family: `IF(AND(@>0,@=@),@&"+120","")`
    e.g. `IF(AND(BC7>0,BC7=$BC$25),BA7&"+120","")`
- [x1] family: `"for"&@&"W(Inputenergy)cangive1kg/hrsteamat"&@&"bar"`
    e.g. `"for "&CU4&" W (Input energy) can give 1kg/hr steam at "&BR10&" bar"`
- [x1] family: `IF(@>0,@&"+"&@&"+120","")`
    e.g. `IF(BB8>0,BA7&"+"&BA8&"+120","")`
- [x1] family: `IF(@=@,@+120,0)`
    e.g. `IF(BC7=$BC$25,BB7+120,0)`
- [x1] family: `IF(@=@,"SteamTemp.","---")`
    e.g. `IF(BR5=EB43,"Steam Temp.","---")`
- [x1] family: `IF(@>0,@,"-")`
    e.g. `IF(BR10>0,$EF$39,"-")`
- [x1] family: `IF(@>0,2,0)`
    e.g. `IF(BB8>0,2,0)`
- [x1] family: `IF(@=@,"Watersupplytemp.","---")`
    e.g. `IF(BR5=EB42,"Water supply temp.","---")`
- [x1] family: `IF(@=@,@/3.6,@)`
    e.g. `IF(F35=AH47,E35/3.6,E35)`
- [x1] family: `PI()*(@/1000)^2/4*@*1000`
    e.g. `PI()*(K7/1000)^2/4*O7*1000`
- [x1] family: `"for1kg/hrsteamat"&@&"barcangive"&@&"W(Outputenergy)"`
    e.g. `"for 1kg/hr steam at "&BR10& " bar can give "& CU4&" W (Output energy)"`
- [x1] family: `@+@`
    e.g. `EF55+EF59`
- [x1] family: `IF(@="m3/h","kg/s","m3/h")`
    e.g. `IF(F35="m3/h","kg/s","m3/h")`
- [x1] family: `IF(@=@,@,@*3.516)`
    e.g. `IF(F19=AF47,E19,E19*3.516)`
- [x1] family: `HLOOKUP(MIN(@),@,2,FALSE)`
    e.g. `HLOOKUP(MIN(CJ124:DF124),CJ124:DF125,2,FALSE)`
- [x1] family: `IF(@>0,1,0)`
    e.g. `IF(BB7>0,1,0)`
- [x1] family: `IF(@=0,"-",130+SUM(@)+120+2*@)`
    e.g. `IF(BC25=0,"-",130+SUM(BM7:BM18)+120+2*BB5)`
- [x1] family: `IF(@="kW","RT","kW")`
    e.g. `IF(F19="kW","RT","kW")`
- [x1] family: `IF(@*@*@>0,MIN(@),"")`
    e.g. `IF(BR7*BR10*BR17>0,MIN(DN28:EA28),"")`
- [x1] family: `IF(@>0,4,0)`
    e.g. `IF(BB10>0,4,0)`
- [x1] family: `IF(@>0,12,0)`
    e.g. `IF(BB18>0,12,0)`
- [x1] family: `IF(@=0,"-",SUM(@))`
    e.g. `IF($BC$25=0,"-",SUM(BF7:BG7))`
- [x1] family: `IF(@>0,7,0)`
    e.g. `IF(BB13>0,7,0)`
- [x1] family: `IF(SUM(@)=0,0,MAX(@))`
    e.g. `IF(SUM(BB7:BB17)=0,0,MAX(BC7:BC18))`
- [x1] family: `IF(@>0,3,0)`
    e.g. `IF(BB9>0,3,0)`
- [x1] family: `IF(@=@,VLOOKUP(@,@,2,FALSE),"---")`
    e.g. `IF(BR5=EB43,VLOOKUP(BR10,EC43:ED54,2,FALSE),"---")`
- [x1] family: `IF(@=@,SUM(@),0)`
    e.g. `IF(BR5=EB43,SUM(EF42:EF54),0)`
- [x1] family: `MIN(@)`
    e.g. `MIN(EF14:EF22)`
- [x1] family: `IF(@>0,10,0)`
    e.g. `IF(BB16>0,10,0)`
- [x1] family: `ROUND(IF(COUNTA(@)>0,1/((1/(@-@))*3.6),""),1)`
    e.g. `ROUND(IF(COUNTA(BR10)>0,1/((1/(BR11-BR15))*3.6),""),1)`
- [x1] family: `IF(COUNTA(@)>0,IF(@="Boilerplant",@,IF(@="Terminals",@,"")),"---")`
    e.g. `IF(COUNTA(BR10)>0,IF(BR5="Boiler plant",CU5, IF(BR5="Terminals",CU6,"")),"---")`
- [x1] family: `IF(@*@>0,VLOOKUP(@,@,2,FALSE),"")`
    e.g. `IF(BR7*BR10>0,VLOOKUP(BQ7,CO7:CP10,2,FALSE),"")`
- [x1] family: `@*3.6`
    e.g. `M7*3.6`
- [x1] family: `IF(@*@*@>0,HLOOKUP(MIN(@),@,3),"-")`
    e.g. `IF(BR7*BR10*BR17>0,HLOOKUP(MIN(DN28:EA28),DN28:EA30,3),"-")`
- [x1] family: `IF(@>0,8,0)`
    e.g. `IF(BB14>0,8,0)`
- [x1] family: `IF(AND(@>0,@>0),IF(@=1,"kg/hr","kW"),"")&@`
    e.g. `IF(AND(BR7>0,BR10>0),IF(CH4=1,"kg/hr ","kW "),"") & CO11`
- [x1] family: `@*3.28`
    e.g. `AG5*3.28`
- [x1] family: `@-2*@`
    e.g. `J7-2*L7`
- [x1] family: `INDEX(@,@)+(@-INDEX(@,@))*(INDEX(@,@+1)-INDEX(@,@))/(INDEX(@,@+1)-INDEX(@,@))`
    e.g. `INDEX(EE62:EE131,ED60) + (ED59-INDEX(ED62:ED131,ED60)) * (INDEX(EE62:EE131,ED60+1)-INDEX(EE62:EE131,ED60)) / (INDEX(ED62:ED131,ED60+1)-INDEX(ED62:ED131,ED60))`
- [x1] family: `IF(@>0,5,0)`
    e.g. `IF(BB11>0,5,0)`
- [x1] family: `IF(@>0,@&"+120","")`
    e.g. `IF(BB7>0,BA7&"+120","")`
- [x1] family: `IF(@>0,6,0)`
    e.g. `IF(BB12>0,6,0)`
- [x1] family: `IF(AND(@="BoilerPlant",@>0,@>0),@,"n/a")`
    e.g. `IF(AND(BR5="Boiler Plant",BR7>0,BR10>0),CJ127,"n/a")`
- [x1] family: `IF(@=@,@,@/3.516)`
    e.g. `IF(F19=AF48,E19,E19/3.516)`
- [x1] family: `IF(@>0,11,0)`
    e.g. `IF(BB17>0,11,0)`
- [x1] family: `IF(AND(@>0,@>0),IF(@=1,@/(@-@)*3600,@/3600*(@-@)),"---")`
    e.g. `IF(AND(BR7>0,BR10>0),IF(CH4=1,BR7/(BR11-BR15)*3600,BR7/3600*(BR11-BR15)),"---")`
- [x1] family: `IF(@>0,VLOOKUP(MIN(@),@,2,FALSE),"")`
    e.g. `IF(AX8>0,VLOOKUP(MIN(AV11:AV19),AV11:AW19,2,FALSE),"")`
- [x1] family: `6.819*(IF(@=0,@,@)/@)^1.852/(@/1000)^1.167*1000*9.81`
    e.g. `6.819*(IF($AE7=0,AG$5,$AE7)/$E$7)^1.852/($K7/1000)^1.167*1000*9.81`

---

## Sheet: Motor   (formula cells: 1822 / total 1822)
- [x200] family: ``
    e.g. ``
- [x11] family: `IF(@=@,@,0)`
    e.g. `IF(AI6=AI7,AH6,0)`
- [x11] family: `IF(@=0,"-",SUM(@))`
    e.g. `IF($AH$6=0,"-",SUM(BI4:BL4))`
- [x4] family: `IF(@>=@,@,"")`
    e.g. `IF(X6>=$AH$21,X6,"")`
- [x3] family: `@*0.001`
    e.g. `BF20*0.001`
- [x3] family: `IF(@=@,@/0.472,0)`
    e.g. `IF(AI6=AI7,BI6/0.472,0)`
- [x3] family: `IF(@=TRUE,150*@,"-")`
    e.g. `IF(BC12=TRUE,150*I25,"-")`
- [x3] family: `IF(@=TRUE,1,"-")`
    e.g. `IF(BC7=TRUE,1,"-")`
- [x3] family: `IF(@="-","-",@+@)`
    e.g. `IF(T11="-","-",T11+T13)`
- [x3] family: `IF(@=TRUE,50*@,"-")`
    e.g. `IF(BC7=TRUE,50*I7,"-")`
- [x3] family: `IF(@=@,@/1000,0)`
    e.g. `IF(AI6=AI9,AH6/1000,0)`
- [x3] family: `IF(@=@,@*3.6,0)`
    e.g. `IF(AI6=AI9,AH6*3.6,0)`
- [x3] family: `@/0.09804139432`
    e.g. `BE21/0.09804139432`
- [x2] family: `IF(@="-","-",VLOOKUP(@,@,3,))`
    e.g. `IF(AM18="-", "-",VLOOKUP(AM18,X6:Z39,3,))`
- [x2] family: `IF(@=@,@/3.6,0)`
    e.g. `IF(AI6=AI7,AH6/3.6,0)`
- [x2] family: `IF(@*@*@*@>0,SUM(@)*@*@,"-")`
    e.g. `IF(O7*O8*O9*O10>0,SUM(O7:O8)*O9*O10,"-")`
- [x2] family: `IF(@="-","-",VLOOKUP(@,@,2,FALSE))`
    e.g. `IF(AM18="-","-",VLOOKUP(AM18,X6:AA39,2,FALSE))`
- [x2] family: `IF(@="fuse",@,VLOOKUP(@,@,2,FALSE))`
    e.g. `IF(AH26="fuse",C27,VLOOKUP(AH26,B27:C30,2,FALSE))`
- [x2] family: `@*9.804139432`
    e.g. `BD20*9.804139432`
- [x2] family: `IF(@=@,@/3600,0)`
    e.g. `IF(AI6=AI7,AH6/3600,0)`
- [x2] family: `IF(@="-","-",@*@)`
    e.g. `IF(AM18="-","-",AM21*BJ10)`
- [x2] family: `IF(@=@,@*3600,0)`
    e.g. `IF(AI6=AI8,AH6*3600,0)`
- [x2] family: `IF(@>0,1,0)`
    e.g. `IF(AX5>0,1,0)`
- [x2] family: `IF(@="-","-",@/9.804139432/1000)`
    e.g. `IF(T15="-","-",T15/9.804139432/1000)`
- [x2] family: `VLOOKUP(@,@,2,FALSE)`
    e.g. `VLOOKUP(AR6,BI17:BJ18,2,FALSE)`
- [x2] family: `@/100`
    e.g. `BF22/100`
- [x2] family: `IF(@=@,@,@)`
    e.g. `IF(AT6=BJ18,BJ17,BJ18)`
- [x2] family: `@&@`
    e.g. `BI20&BI23`
- [x2] family: `IF(@="-","-",VLOOKUP(@,@,6,FALSE))`
    e.g. `IF(AM18="-","-",VLOOKUP(AM18,X6:AC39,6,FALSE))`
- [x2] family: `IF(@="-","-",MIN(@))`
    e.g. `IF(AM17="-","-",MIN(BO5:BO38))`
- [x2] family: `IF(@="-","-",IF(@=@,"VSD",VLOOKUP(@,@,4,FALSE)))`
    e.g. `IF(AM18="-","-",IF(AM23=BI11,"VSD",VLOOKUP(AM18,X6:AA39,4,FALSE)))`
- [x2] family: `IF(@=@,@*1000,0)`
    e.g. `IF(AI6=AI8,AH6*1000,0)`
- [x2] family: `IF(OR(AND(@>@,@<@),@=@),"DOL",IF(OR(@<@,@=@),"fuse",IF(OR(@=@,@>@),"Auto-Tx","Υ/Δ")))`
    e.g. `IF(OR(AND(X6>$B$34,X6<$B$35),X6=$B$35),"DOL",IF(OR(X6<$B$34,X6=$B$34),"fuse",IF(OR(X6=$B$36,X6>$B$36),"Auto-Tx","Υ/Δ")))`
- [x2] family: `@+@`
    e.g. `BJ20+BJ23`
- [x1] family: `IF(@*@*@>0,0.002342*@/(@*@),"-")`
    e.g. `IF(AY11*AY12*AY13>0,0.002342*AY11/(AY12*AY13),"-")`
- [x1] family: `IF(@=@,@*0.472,0)`
    e.g. `IF(AI6=AI10,AH6*0.472,0)`
- [x1] family: `IF(@=@,"1ØCurrent","")`
    e.g. `IF(AR6=BI17,"1Ø Current","")`
- [x1] family: `@*0.09804139432`
    e.g. `BD20*0.09804139432`
- [x1] family: `IF(@=TRUE,100*@,"-")`
    e.g. `IF(BC8=TRUE,100*I8,"-")`
- [x1] family: `IF(@=@,"嚴寒","n/a")`
    e.g. `IF(AX5=BI44,"嚴寒","n/a")`
- [x1] family: `IF(@="-","-",@*(@*(@*9.804139432))/(@))`
    e.g. `IF(AM8="-","-",AM15*(AM8*(AM11*9.804139432))/(AM13))`
- [x1] family: `IF(@=TRUE,10*@,"-")`
    e.g. `IF(BC9=TRUE,10*I22,"-")`
- [x1] family: `IF(OR(@<@,@=@),@*1000/@/0.85,@*1000/(3)^0.5/@/0.85)`
    e.g. `IF(OR(X6<$B$33, X6=$B$33), X6*1000/$C$18/0.85, X6*1000/(3)^0.5/$C$19/0.85)`
- [x1] family: `IF(@="-","-",@+@+@)`
    e.g. `IF(O11="-","-",O11+O13+O15)`
- [x1] family: `IF(@="fuse",@*@,VLOOKUP(@,@,2,FALSE)*@)`
    e.g. `IF(AA6="fuse",Y6*$C$27, VLOOKUP(AA6,$B$27:$C$30,2,FALSE)*Y6)`
- [x1] family: `IF(@=TRUE,350*@,"-")`
    e.g. `IF(BC11=TRUE,350*I24,"-")`
- [x1] family: `IF(@+@=0,"-",VLOOKUP(@,@,2,FALSE))`
    e.g. `IF(BF39+BF40=0,"-",VLOOKUP(BI39,BI48:BJ52,2,FALSE))`
- [x1] family: `IF(@="-","-",IF(AND(@*@*@>0,@>=@),"不滿足","滿足"))`
    e.g. `IF(AX7="-","-",IF(AND(AY11*AY12*AY13>0,AY15>=AX7),"不滿足","滿足"))`
- [x1] family: `IF(@=@,@/1000*(3)^0.5*@*0.85,0)`
    e.g. `IF(AR6=BI18,AS6/1000*(3)^0.5*$C$19*0.85,0)`
- [x1] family: `IF(@=@,"寒冷/夏熱冬冷","n/a")`
    e.g. `IF(AX5=BI44,"寒冷/夏熱冬冷","n/a")`
- [x1] family: `IF(@=@,"3ØPower","")`
    e.g. `IF(AR6=BI18,"3Ø Power","")`
- [x1] family: `IF(@=@,@/1000*@*0.85,0)`
    e.g. `IF(AR6=BI18,AS6/1000*$C$18*0.85,0)`
- [x1] family: `IF(@=@,"3ØCurrent","")`
    e.g. `IF(AR6=BI17,"3Ø Current","")`
- [x1] family: `IF(AND(@<1,@>=0),@,IF(@>2,@,IF(OR(@>1,@<=2),@)))`
    e.g. `IF(AND(AH8<1,AH8>=0),$C$22,IF(AH8>2,$C$24,IF(OR(AH8>1,AH8<=2),$C$23)))`
- [x1] family: `@&"-"&@`
    e.g. `AX5&"-"&AX6`
- [x1] family: `@*1000`
    e.g. `BG23*1000`
- [x1] family: `SUM(@)`
    e.g. `SUM(J22:J27)`
- [x1] family: `IF(@*@*@>0,@*@*@,"-")`
    e.g. `IF(J11*J12*J13>0,J11*J13*J12,"-")`
- [x1] family: `IF(OR(@<@,@=@),"1Ø","3Ø")`
    e.g. `IF(OR(X6<$B$33, X6=$B$33),"1Ø", "3Ø")`
- [x1] family: `IF(@*@*@>0,SUM(@,@),"-")`
    e.g. `IF(J11*J12*J13>0,SUM(J7:J9,J14),"-")`
- [x1] family: `IF(@=@,"夏熱冬暖","n/a")`
    e.g. `IF(AX5=BI44,"夏熱冬暖","n/a")`
- [x1] family: `IF(@=TRUE,2,"-")`
    e.g. `IF(BC8=TRUE,2,"-")`
- [x1] family: `IF(@=@,@*1000/@/0.85,0)`
    e.g. `IF(AR6=BI17,AS6*1000/$C$18/0.85,0)`
- [x1] family: `IF(@=@,"1ØPower","")`
    e.g. `IF(AR6=BI18,"1Ø Power","")`
- [x1] family: `IF(@="-","-",@*(@*(@+@))/(1000*@*@))`
    e.g. `IF(AH8="-","-",AH19*(AH8*(AH12+AH13))/(1000*AH15*AH17))`
- [x1] family: `IF(@=@,@*1000/(3)^0.5/@/0.85,0)`
    e.g. `IF(AR6=BI17,AS6*1000/(3)^0.5/$C$19/0.85,0)`

---

## Sheet: Acoustics   (formula cells: 243 / total 243)
- [x1] family: `IF(@>0,10*LOG(10^(0.1*@)+10^(0.1*@)+10^(0.1*@)+10^(0.1*@),10),"-")`
    e.g. `IF(R6>0,10*LOG(10^(0.1*R6)+10^(0.1*R7)+10^(0.1*R8)+10^(0.1*R9),10),"-")`
- [x1] family: `IF(@*@*@>0,@-10*LOG(4*PI()*(@)^2)+10*LOG(@),"-")`
    e.g. `IF(F6*F7*F8>0,F6-10*LOG(4*PI()*(F7)^2)+10*LOG(F8),"-")`
- [x1] family: `IF(@*@*@>0,@+10*LOG(4*PI()*(@)^2)-10*LOG(@),"-")`
    e.g. `IF(L6*L7*L8>0,L6+10*LOG(4*PI()*(L7)^2)-10*LOG(L8),"-")`

---

## Sheet: Chiller   (formula cells: 815 / total 815)
- [x9] family: `IF(@=0,"-",SUM(@))`
    e.g. `IF($H$4=0,"-",SUM(AO43:AO46))`
- [x9] family: `IF(@=@,@,0)`
    e.g. `IF($D$10=$D$11,$C$10,0)`
- [x4] family: `@/3.516`
    e.g. `AP37/3.516`
- [x4] family: `@*@`
    e.g. `AB14*AC14`
- [x4] family: `@/2.6`
    e.g. `AP36/2.6`
- [x4] family: `@*860`
    e.g. `AP36*860`
- [x3] family: `@*12000`
    e.g. `AO36*12000`
- [x2] family: `@/2.798708`
    e.g. `AQ43/2.798708`
- [x2] family: `VLOOKUP(@,@,2,FALSE)`
    e.g. `VLOOKUP(AA5,$AO$26:$AQ$27,2,FALSE)`
- [x2] family: `IF(@>0,1/@*1000,0)`
    e.g. `IF(AO43>0,1/AP43*1000,0)`
- [x2] family: `@/(1/(10.7*3.516))`
    e.g. `AP45/(1/(10.7*3.516))`
- [x2] family: `IF(@>0,1000/@,0)`
    e.g. `IF(AQ45>0,1000/AQ45,0)`
- [x2] family: `VLOOKUP(@,@,3,FALSE)`
    e.g. `VLOOKUP(AA5,$AO$26:$AQ$27,3,FALSE)`
- [x2] family: `@/3412`
    e.g. `AR39/3412`
- [x1] family: `@/(10.7*3.516)`
    e.g. `AO43/(10.7*3.516)`
- [x1] family: `IF(@="ft2","m2","ft2")`
    e.g. `IF(I19="ft2","m2","ft2")`
- [x1] family: ``
    e.g. ``
- [x1] family: `IF(@="-","-",@*@/1000)`
    e.g. `IF(H6="-","-",H6*H10/1000)`
- [x1] family: `@*2.798708`
    e.g. `AR46*2.798708`
- [x1] family: `SUM(@)`
    e.g. `SUM(AD14:AD17)`
- [x1] family: `IF(@="-","-",@/2.6)`
    e.g. `IF(H6="-","-",H11/2.6)`
- [x1] family: `IF(@="-","-",@*12000)`
    e.g. `IF(H6="-","-",H12*12000)`
- [x1] family: `@*2.6`
    e.g. `AQ38*2.6`
- [x1] family: `IF(@="-","-",@*860)`
    e.g. `IF(H6="-","-",H11*860)`
- [x1] family: `IF(@=@,@,@)`
    e.g. `IF(AA5=AO26,AO27,AO26)`
- [x1] family: `@/860*3412`
    e.g. `AS40/860*3412`
- [x1] family: `@*3.516`
    e.g. `AO36*3.516`
- [x1] family: `IF(@=0,"-",IF(@=@,1/(@/3.516),3.516/@))`
    e.g. `IF(AB5=0,"-",IF(AA5=AO26,1/(AB5/3.516),3.516/AB5))`
- [x1] family: `IF(@=0,"-",IF(@="ft2",@/10.76391,@*10.76391))`
    e.g. `IF(H19=0,"-",IF(I19="ft2",H19/10.76391,H19*10.76391))`
- [x1] family: `@*(10.7*3.516)`
    e.g. `AP44*(10.7*3.516)`
- [x1] family: `IF(@="-","-",@/3.516)`
    e.g. `IF(H6="-","-",H11/3.516)`

---

## Sheet: Boiler   (formula cells: 1171 / total 1171)
- [x47] family: ``
    e.g. ``
- [x8] family: `MAX(@,@,@)`
    e.g. `MAX(AF54,AF61,AF68)`
- [x6] family: `IF(@=@,@,0)`
    e.g. `IF($D$10=$D11,$C$10,0)`
- [x5] family: `@*860`
    e.g. `AE16*860`
- [x5] family: `@/1000`
    e.g. `AF15/1000`
- [x4] family: `@/668*1000`
    e.g. `AG16/668*1000`
- [x4] family: `IF(@="-","-",@*@)`
    e.g. `IF(I7="-","-",I19*I5)`
- [x4] family: `@*33439`
    e.g. `AE17*33439`
- [x3] family: `@/9.83`
    e.g. `AE16/9.83`
- [x2] family: `IF(@="-","-","ø"&VLOOKUP(@,@,7,FALSE))`
    e.g. `IF(I7="-","-","ø"&VLOOKUP(I6,AD32:AN37,7,FALSE))`
- [x2] family: `IF(@="-","-",@/3.6)`
    e.g. `IF(O18="-","-",O18/3.6)`
- [x2] family: `IF(@="-","-","ø"&VLOOKUP(@,@,9,FALSE))`
    e.g. `IF(I7="-","-","ø"&VLOOKUP(I6,AD32:AN37,9,FALSE))`
- [x2] family: `IF(@="-","-","ø"&VLOOKUP(@,@,6,FALSE))`
    e.g. `IF(I7="-","-","ø"&VLOOKUP(I6,AD32:AN37,6,FALSE))`
- [x2] family: `@*9.83`
    e.g. `AH17*9.83`
- [x2] family: `IF(@="-","-",VLOOKUP(@,@,5,FALSE))`
    e.g. `IF(I7="-","-",VLOOKUP(I6,AD32:AH37,5,FALSE))`
- [x2] family: `(@/1000/2)^2*PI()`
    e.g. `(Z5/1000/2)^2*PI()`
- [x2] family: `IF(@="-","-",VLOOKUP(@,@,15,FALSE))`
    e.g. `IF($I$7="-","-",VLOOKUP($I$6,$AD$32:$AR$37,15,FALSE))`
- [x2] family: `IF(@="-","-",VLOOKUP(@,@,12,FALSE))`
    e.g. `IF(I7="-","-",VLOOKUP(I6,AD32:AR37,12,FALSE))`
- [x2] family: `IF(@="-","-",VLOOKUP(@,@,13,FALSE))`
    e.g. `IF($I$7="-","-",VLOOKUP($I$6,$AD$32:$AR$37,13,FALSE))`
- [x2] family: `IF(@="-","-",VLOOKUP(@,@,2,FALSE))`
    e.g. `IF(I7="-","-",VLOOKUP(I6,AD32:AH37,2,FALSE))`
- [x2] family: `IF(@="-","-",VLOOKUP(@,@,3,FALSE))`
    e.g. `IF(I7="-","-",VLOOKUP(I6,AD32:AH37,3,FALSE))`
- [x2] family: `@*668`
    e.g. `AE14*668`
- [x2] family: `IF(@="-","-","ø"&VLOOKUP(@,@,4,FALSE))`
    e.g. `IF(I7="-","-","ø"&VLOOKUP(I6,AD32:AN37,4,FALSE))`
- [x2] family: `IF(@="-","-",VLOOKUP(@,@,14,FALSE))`
    e.g. `IF($I$7="-","-",VLOOKUP($I$6,$AD$32:$AR$37,14,FALSE))`
- [x1] family: `@/2.6`
    e.g. `AJ16/2.6`
- [x1] family: `IF(@>0,SUM(@),"-")`
    e.g. `IF($C$10>0,SUM(AE14:AJ14),"-")`
- [x1] family: `IF(@="-","-",VLOOKUP(@,@,9,FALSE))`
    e.g. `IF(U7="-","-",VLOOKUP(U6,AD43:AN51,9,FALSE))`
- [x1] family: `IF(@*@*@*@=0,"-",@*1000/4.185/@)`
    e.g. `IF(U5*U6*U10*U11=0,"-",U6*1000/4.185/U12)`
- [x1] family: `IF(@="-","-",(@+@*0.13)*1.1)`
    e.g. `IF(I7="-","-",(I6+I6*0.13)*1.1)`
- [x1] family: `(@/PI())^0.5*2*1000`
    e.g. `(AA11/PI())^0.5*2*1000`
- [x1] family: `@/860*3412`
    e.g. `AJ19/860*3412`
- [x1] family: `IF(@*@>0,@*@,"-")`
    e.g. `IF(I5*I6>0,I5*I6,"-")`
- [x1] family: `IF(SUM(@)=0,@,IF(SUM(@)>0,SUM(@)*1.2,0))`
    e.g. `IF(SUM(AA6:AA9)=0,AA5,IF(SUM(AA5:AA9)>0,SUM(AA5:AA9)*1.2,0))`
- [x1] family: `@`
    e.g. `AK54`
- [x1] family: `@*1000`
    e.g. `AE14*1000`
- [x1] family: `@/33439`
    e.g. `AI18/33439`
- [x1] family: `IF(@*@>0,"="&@&"x(1+0.13)x1.1","-")`
    e.g. `IF(I6*I5>0,"= "&I6&" x (1 + 0.13) x 1.1","-")`
- [x1] family: `IF(@="-","-",@*1.5)`
    e.g. `IF(I7="-","-",O18*1.5)`
- [x1] family: `IF(@="-","-","="&ROUND(@,2)*1000&"/4.185/"&@)`
    e.g. `IF(U7="-","-","= "&ROUND(U6,2)*1000&" /4.185 / "&U12)`
- [x1] family: `IF(@="-","-","=1.5x"&ROUND(@,2))`
    e.g. `IF(O18="-","-","= 1.5 x "&ROUND(O18,2))`
- [x1] family: `@/3412`
    e.g. `AJ18/3412`
- [x1] family: `IF(@="-","-",@*3.6)`
    e.g. `IF(U23="-","-",U23*3.6)`
- [x1] family: `@-@`
    e.g. `U10-U11`
- [x1] family: `IF(@="-","-","ø"&VLOOKUP(@,@,11,FALSE))`
    e.g. `IF(U7="-","-","ø"&VLOOKUP(U6,AD43:AR51,11,FALSE))`
- [x1] family: `IF(@>0,MROUND(@,50),"-")`
    e.g. `IF(AA12>0,MROUND(AA12,50),"-")`
- [x1] family: `IF(@="-","-",@*1000*@/60)`
    e.g. `IF(I7="-","-",I7*1000*O12/60)`
- [x1] family: `IF(@="-","-","ø"&VLOOKUP(@,@,8,FALSE))`
    e.g. `IF(U7="-","-","ø"&VLOOKUP(U6,AD43:AN51,8,FALSE))`
- [x1] family: `IF(@="-","-",IF(@=@,2,1))`
    e.g. `IF(I7="-","-",IF(O7=AE23,2,1))`
- [x1] family: `IF(@*@>0,ROUND(@*@,2),"-")`
    e.g. `IF(U5*U6>0,ROUND(U5*U6,2),"-")`
- [x1] family: `IF(@="-","-",@*1000/@*@/60)`
    e.g. `IF(I7="-","-",I7*1000/O8*O6/60)`
- [x1] family: `IF(@="-","-",VLOOKUP(@,@,10,FALSE))`
    e.g. `IF(I7="-","-",VLOOKUP(I6,AD32:AN37,10,FALSE))`

---

## Sheet: Hx   (formula cells: 536 / total 536)
- [x4] family: `@`
    e.g. `C19`
- [x4] family: ``
    e.g. ``
- [x2] family: `IF(@="-","-",@*3.6)`
    e.g. `IF(P32="-","-",P32*3.6)`
- [x2] family: `IF(@="-","-",@/4.185/@)`
    e.g. `IF(C13="-","-",M7/4.185/C13)`
- [x2] family: `@-@`
    e.g. `H35-H31`
- [x2] family: `ABS(@-@)`
    e.g. `ABS(C16-C11)`
- [x2] family: `IF(@*@*@>0,ABS(@-@),"-")`
    e.g. `IF(C11*C12*C5>0,ABS(C11-C12),"-")`
- [x2] family: `IF(@<=@,@,"")`
    e.g. `IF($C$27<=N15,N15,"")`
- [x1] family: `IF(@*@=0,"",IF(@-@>=0,"ok","x"))`
    e.g. `IF(C11*C12=0,"",IF(C11-C12>=0,"ok","x"))`
- [x1] family: `VLOOKUP(@,@,2,FALSE)`
    e.g. `VLOOKUP(C19,O32:Q33,2,FALSE)`
- [x1] family: `VLOOKUP(@,@,3,FALSE)`
    e.g. `VLOOKUP(C19,O32:Q33,3,FALSE)`
- [x1] family: `IF(@="-","-",@/@*@)`
    e.g. `IF(M7="-","-",R23/N22*C27)`
- [x1] family: `IF(@="-","-",VLOOKUP(@,@,5,FALSE))`
    e.g. `IF(M7="-","-",VLOOKUP($N$22,$N$15:$R$20,5,FALSE))`
- [x1] family: `IF(@="-","-",MIN(@))`
    e.g. `IF(M7="-","-",MIN(L15:L20))`
- [x1] family: `IF(@-@=0,"A=U∆T/Q","A=UxLogmeantemperature/Q")`
    e.g. `IF(O6-O7=0,"A = U∆T / Q","A = U x Log mean temperature / Q")`
- [x1] family: `IF(@=1,@,@)`
    e.g. `IF(M9=1,C16,C15)`
- [x1] family: `IF(@=2,@,@)`
    e.g. `IF(M9=2,C16,C15)`
- [x1] family: `IF(OR(@="-",@="-",@="-",@="x"),"-",@/@/@*1000)`
    e.g. `IF(OR(C6="-",C13="-",C17="-",J41="x"),"-",M7/C23/O8*1000)`
- [x1] family: `IF(@=@,@,@)`
    e.g. `IF(D5=M6,M5,M6)`
- [x1] family: `IF(@=2,@,"←")`
    e.g. `IF(M9=2,H25,"←")`
- [x1] family: `IF(@="-","-",VLOOKUP(@,@,4,FALSE))`
    e.g. `IF(M7="-","-",VLOOKUP($N$22,$N$15:$R$20,4,FALSE))`
- [x1] family: `IF(@*@*@*@=0,"",IF(@<=0,"x","ok"))`
    e.g. `IF(C11*C12*C15*C16=0,"",IF(H40<=0,"x","ok"))`
- [x1] family: `IF(@=0,"-",IF(@=@,@*3.516,@/3.516))`
    e.g. `IF(C5=0,"-",IF(D5=M6,C5*3.516,C5/3.516))`
- [x1] family: `IF(@*@=0,"",IF(@-@<=0,"ok","x"))`
    e.g. `IF(C15*C16=0,"",IF(C15-C16<=0,"ok","x"))`
- [x1] family: `IF(@-@=0,"∆T","Logmeantemperature")`
    e.g. `IF(O6-O7=0,"∆T","Log mean temperature")`
- [x1] family: `IF(@="-","-",VLOOKUP(@,@,2,FALSE))`
    e.g. `IF(M7="-","-",VLOOKUP($N$22,$N$15:$R$20,2,FALSE))`
- [x1] family: `IF(@=1,"Out","In")`
    e.g. `IF(M9=1,"Out","In")`
- [x1] family: `IF(@="-","-",@-900)`
    e.g. `IF(M7="-","-",R22-900)`
- [x1] family: `IF(@="ok",@&"x"&@&"x"&@,"-")`
    e.g. `IF(J41="ok",R25&" x "&P22&" x "&O22,"-")`
- [x1] family: `@*@`
    e.g. `H38*H39`
- [x1] family: `IF(@="x","-",@)`
    e.g. `IF(J41="x","-",O8)`
- [x1] family: `IF(OR(@="x",@="x"),"Error:InappropriateTemperatures","")`
    e.g. `IF(OR(J31="x",J35="x"),"Error: Inappropriate Temperatures","")`
- [x1] family: `IF(@="-","-",IF(@=@,@,@))`
    e.g. `IF(C6="-","-",IF(D5=M5,C5,C6))`
- [x1] family: `IF(@="-","-",MROUND(ROUNDUP(@+25,1),50)+1000)`
    e.g. `IF(M7="-","-",MROUND(ROUNDUP(R24+25,1),50)+1000)`
- [x1] family: `IF(@="x","Error:TemperatureCross","")`
    e.g. `IF(J39="x","Error: Temperature Cross","")`
- [x1] family: `IF(OR(@="-",@="-",@="-"),"-",IF(@-@=0,(@+@)/2,(@-@)/LN(@/@)))`
    e.g. `IF(OR(C13="-",C17="-",C6="-"),"-",IF(O6-O7=0,(C17+C13)/2,(O6-O7)/LN(O6/O7)))`
- [x1] family: `IF(OR(@="x",@="-"),"-",VLOOKUP(@,@,2,FALSE))`
    e.g. `IF(OR(J41="x",M7="-"),"-",VLOOKUP(N22,L15:M20,2,FALSE))`
- [x1] family: `IF(@="-","-",VLOOKUP(@,@,3,FALSE))`
    e.g. `IF(M7="-","-",VLOOKUP($N$22,$N$15:$R$20,3,FALSE))`
- [x1] family: `IF(@*@*@*@*@=0,"",IF(AND(@="ok",@="ok",@="ok"),"ok","x"))`
    e.g. `IF(C5*C11*C12*C15*C16=0,"",IF(AND(J39="ok",J35="ok",J31="ok"),"ok","x"))`
- [x1] family: `@&""&@`
    e.g. `K31&" "&K39`
- [x1] family: `IF(@=2,"Out","In")`
    e.g. `IF(M9=2,"Out","In")`

---

## Sheet: AHU   (formula cells: 5444 / total 5444)
- [x662] family: ``
    e.g. ``
- [x41] family: `IF(@=TRUE,@,0)`
    e.g. `IF($AI$3=TRUE,AI6,0)`
- [x7] family: `IF(@=@,"►","")`
    e.g. `IF($N$54=O7,"►","")`
- [x6] family: `@`
    e.g. `O7`
- [x5] family: `@/3.6`
    e.g. `Q7/3.6`
- [x4] family: `IF(@<=@,@,"")`
    e.g. `IF($E$27<=O31,O31,"")`
- [x4] family: `IF(@=0,"-",SUM(@))`
    e.g. `IF(E22=0,"-",SUM(AK58:AK61))`
- [x4] family: `IF(@=@,@,0)`
    e.g. `IF(F22=J22,E22,0)`
- [x4] family: `MIN(@)`
    e.g. `MIN(N31:N52)`
- [x2] family: `@*0.413845619`
    e.g. `AM58*0.413845619`
- [x2] family: `150+SUM(@)`
    e.g. `150+SUM(AT6:BA6)`
- [x2] family: `IF(@>0,1/@*1000,0)`
    e.g. `IF(AK58>0,1/AL58*1000,0)`
- [x2] family: `IF(@>0,1000/@,0)`
    e.g. `IF(AM60>0,1000/AM60,0)`
- [x2] family: `@/(1/(10.7*3.516))`
    e.g. `AL60/(1/(10.7*3.516))`
- [x1] family: `@/(10.7*3.516)`
    e.g. `AK58/(10.7*3.516)`
- [x1] family: `VLOOKUP(@,@,2,FALSE)`
    e.g. `VLOOKUP(C33,AK64:AL65,2,FALSE)`
- [x1] family: `IF(@*@*@=0,"-",@*@+@*@)`
    e.g. `IF(E32*E35*E33=0,"-",E32*E36+E34*E35)`
- [x1] family: `IF(AND(@>0,@>0),@*@*@/1000,"n/a")`
    e.g. `IF(AND(E21>0,E22>0),I23*E21*E23/1000,"n/a")`
- [x1] family: `@/0.413845619`
    e.g. `AN61/0.413845619`
- [x1] family: `@*(10.7*3.516)`
    e.g. `AL59*(10.7*3.516)`
- [x1] family: `IF(@="n/a","-",@/1.23/(@-@)*1000)`
    e.g. `IF(E24="n/a","-",E24/1.23/(E25-E26)*1000)`
- [x1] family: `IF(@*@=0,"-",IF(@=@,@/@,@))`
    e.g. `IF(E32*E33=0,"-",IF(C33=AK64,E32/E33,E33))`

---

## Sheet: Fan   (formula cells: 3757 / total 3757)

---

## Sheet: FCU   (formula cells: 3932 / total 3932)
- [x1602] family: ``
    e.g. ``
- [x72] family: `IF(AND(@=@,@=@,@=@),@,"")`
    e.g. `IF(AND($W$4=$X$4,V$42=$Z$4,V$43=$AA$4),V16,"")`
- [x39] family: `@`
    e.g. `C11`
- [x33] family: `ROUND(6.819*(@/@)^1.852/(@/1000)^1.167*1000*9.81,0)`
    e.g. `ROUND(6.819*(BW7/BS2)^1.852/(BT7/1000)^1.167*1000*9.81,0)`
- [x33] family: `(IF(@=0,@,@)/1000/9.81*(@/1000)^1.167/6.819)^(1/1.852)*@`
    e.g. `(IF(BY7=0,CA5,BY7)/1000/9.81*(BT7/1000)^1.167/6.819)^(1/1.852)*BS2`
- [x33] family: `IF(@<=@,IF(@<=IF(@=0,@,@),@,(@/1000/9.81*(@/1000)^1.167/6.819)^(1/1.852)*@),IF(@<=IF(@=0,@,@),@,"Check"))`
    e.g. `IF(CB7<=CA5,IF(CA7<=IF(BZ7=0,CB5,BZ7),CA7,(CB7/1000/9.81*(BT7/1000)^1.167/6.819)^(1/1.852)*BS2),IF(CA7<=IF(BZ7=0,CB5,BZ7),CA7,"Check"))`
- [x33] family: `6.819*(IF(@=0,@,@)/@)^1.852/(@/1000)^1.167*1000*9.81`
    e.g. `6.819*(IF(BZ7=0,CB5,BZ7)/BS2)^1.852/(BT7/1000)^1.167*1000*9.81`
- [x24] family: `IF(AND(@=@,@=@,@=@,@=@),@,"")`
    e.g. `IF(AND($W$4=$X$4,$AN$42=$Z$4,AN$44=$AA$4,$AN$41=$AD$4),AN16,"")`
- [x21] family: `@*0.87`
    e.g. `AA21*0.87`
- [x19] family: `@*0.85`
    e.g. `Z21*0.85`
- [x16] family: `@*0.92`
    e.g. `AF22*0.92`
- [x15] family: `@*0.83`
    e.g. `AP19*0.83`
- [x13] family: `@*1.04`
    e.g. `AG23*1.04`
- [x13] family: `@*0.93`
    e.g. `AG22*0.93`
- [x12] family: `@*0.86`
    e.g. `Z20*0.86`
- [x11] family: `@*0.75`
    e.g. `AS28*0.75`
- [x10] family: `@*1.05`
    e.g. `AF22*1.05`
- [x10] family: `@*0.62`
    e.g. `AA16*0.62`
- [x10] family: `@*0.79`
    e.g. `AP16*0.79`
- [x10] family: `@*0.9`
    e.g. `AF24*0.9`
- [x10] family: `@*0.84`
    e.g. `AA18*0.84`
- [x9] family: `@*0.69`
    e.g. `AA20*0.69`
- [x8] family: `@*0.77`
    e.g. `Z17*0.77`
- [x8] family: `@*0.74`
    e.g. `AG32*0.74`
- [x8] family: `@*0.64`
    e.g. `AA18*0.64`
- [x8] family: `@*0.88`
    e.g. `AA20*0.88`
- [x8] family: `@*0.89`
    e.g. `AF23*0.89`
- [x8] family: `@*0.73`
    e.g. `AF23*0.73`
- [x7] family: `@*0.6`
    e.g. `AP16*0.6`
- [x7] family: `@*0.82`
    e.g. `Z18*0.82`
- [x7] family: `@*0.67`
    e.g. `AP20*0.67`
- [x7] family: `SUM(@,@,@,@,@,@,@,@,@,@,@,@)`
    e.g. `SUM(V45,V51,V57,V63,X45,X51,X57,X63,Z45,Z51,Z57,Z63)`
- [x7] family: `@*0.8`
    e.g. `AA16*0.8`
- [x6] family: `@*0.91`
    e.g. `AG23*0.91`
- [x6] family: `@*0.7`
    e.g. `AG31*0.7`
- [x6] family: `@*0.56`
    e.g. `Z17*0.56`
- [x6] family: `IF(SUM(@)>0,SUM(@),"-")`
    e.g. `IF(SUM(BK10:BK15)>0,SUM(BK10:BK15),"-")`
- [x5] family: `@*0.76`
    e.g. `AF22*0.76`
- [x5] family: `@*0.78`
    e.g. `Z16*0.78`
- [x4] family: `IF(@=@,@,"")`
    e.g. `IF($C$11=$W$4,BF16,"")`
- [x4] family: `@*0.57`
    e.g. `AP17*0.57`
- [x4] family: `@*0.59`
    e.g. `Z19*0.59`
- [x4] family: `IF(@<=@,@,"")`
    e.g. `IF($BN$16<=BT43,BT43,"")`
- [x3] family: `@*0.61`
    e.g. `Z18*0.61`
- [x3] family: `@*0.81`
    e.g. `Z19*0.81`
- [x3] family: `SUM(@,@,@)`
    e.g. `SUM(V72,AB72,AH72)`
- [x3] family: `@*0.58`
    e.g. `Z16*0.58`
- [x2] family: `@*0.65`
    e.g. `Z20*0.65`
- [x2] family: `IF(@>0,VLOOKUP(@,@,6)*@,"-")`
    e.g. `IF(BK10>0,VLOOKUP(BJ10,F6:K11,6)*BK10,"-")`
- [x2] family: `@*0.66`
    e.g. `AS32*0.66`
- [x2] family: `@*0.68`
    e.g. `AG28*0.68`
- [x2] family: `IF(@="-","-",@)`
    e.g. `IF(BN16="-","-",BR77)`
- [x2] family: `IF(@>0,VLOOKUP(@,@,5)*@,"-")`
    e.g. `IF(BK10>0,VLOOKUP(BJ10,F6:J11,5)*BK10,"-")`
- [x2] family: `@*0.63`
    e.g. `AA19*0.63`
- [x2] family: `SUM(@)`
    e.g. `SUM(AN72:AP72)`
- [x2] family: `IF(@>0,VLOOKUP(@,@,8)*@,"-")`
    e.g. `IF(BK10>0,VLOOKUP(BJ10,$F$6:$P$11,8)*BK10,"-")`
- [x2] family: `@*0.72`
    e.g. `AA21*0.72`
- [x2] family: `IF(@>0,@/1000,"n/a")`
    e.g. `IF(V79>0,V79/1000,"n/a")`
- [x2] family: `IF(@>0,VLOOKUP(@,@,7)*@,"-")`
    e.g. `IF(BK10>0,VLOOKUP(BJ10,$F$6:$R$11,7)*BK10,"-")`
- [x2] family: `VLOOKUP(MIN(@),@,2)`
    e.g. `VLOOKUP(MIN(BR43:BR75),BR43:BS75,2)`
- [x1] family: `8966*1`
    e.g. `8966*1`
- [x1] family: `11030*1`
    e.g. `11030*1`
- [x1] family: `7808*1`
    e.g. `7808*1`
- [x1] family: `6554*1`
    e.g. `6554*1`
- [x1] family: `IF(@="4-pipe","*3-rowcoolingcoil+1-rowheatingcoilisselected","*3-rowcoolingcoilisselected")`
    e.g. `IF(C9="4-pipe","*3-row cooling coil + 1-row heating coil is selected","*3-row cooling coil is selected")`
- [x1] family: `7650*1`
    e.g. `7650*1`
- [x1] family: `@*0.472`
    e.g. `G6*0.472`
- [x1] family: `2890*1`
    e.g. `2890*1`
- [x1] family: `4040*1`
    e.g. `4040*1`
- [x1] family: `3999*1`
    e.g. `3999*1`
- [x1] family: `8061*1`
    e.g. `8061*1`
- [x1] family: `9970*1`
    e.g. `9970*1`
- [x1] family: `3620*1`
    e.g. `3620*1`
- [x1] family: `SUM(@,@,@,@)`
    e.g. `SUM(BF45,BF51,BF57,BF63)`
- [x1] family: `6810*1`
    e.g. `6810*1`
- [x1] family: `@*0.94`
    e.g. `AG26*0.94`
- [x1] family: `SUM(@,@)`
    e.g. `SUM(AN79,AW79)`
- [x1] family: `7700*1`
    e.g. `7700*1`
- [x1] family: `@*1.03`
    e.g. `AG27*1.03`
- [x1] family: `2840*1`
    e.g. `2840*1`
- [x1] family: `@/1000/9.81*100`
    e.g. `CA5/1000/9.81*100`
- [x1] family: `IF(OR(@=@,@>@),@,"")`
    e.g. `IF(OR(CB54=$BP$16,CB54>$BP$16),CB54,"")`
- [x1] family: `9210*1`
    e.g. `9210*1`
- [x1] family: `6070*1`
    e.g. `6070*1`
- [x1] family: `5735*1`
    e.g. `5735*1`
- [x1] family: `VLOOKUP(@,@,2,FALSE)`
    e.g. `VLOOKUP(C15,AA6:AB8,2,FALSE)`
- [x1] family: `4710*1`
    e.g. `4710*1`
- [x1] family: `3310*1`
    e.g. `3310*1`
- [x1] family: `6040*1`
    e.g. `6040*1`
- [x1] family: `6710*1`
    e.g. `6710*1`
- [x1] family: `7040*1`
    e.g. `7040*1`
- [x1] family: `4740*1`
    e.g. `4740*1`
- [x1] family: `5410*1`
    e.g. `5410*1`
- [x1] family: `3650*1`
    e.g. `3650*1`
- [x1] family: `IF(@="n/a","n/a",@/(4.2*(12-7)))`
    e.g. `IF(J6="n/a","n/a",J6/(4.2*(12-7)))`
- [x1] family: `8650*1`
    e.g. `8650*1`
- [x1] family: `2180*1`
    e.g. `2180*1`
- [x1] family: `IF(@="n/a","n/a",@/(4.2*(60-50)))`
    e.g. `IF(K6="n/a","n/a",K6/(4.2*(60-50)))`
- [x1] family: `5880*1`
    e.g. `5880*1`
- [x1] family: `7269*1`
    e.g. `7269*1`
- [x1] family: `IF(@>0,@*0.39,"-")`
    e.g. `IF(BK10>0,BL10*0.39,"-")`
- [x1] family: `5212*1`
    e.g. `5212*1`
- [x1] family: `4780*1`
    e.g. `4780*1`
- [x1] family: `3013*1`
    e.g. `3013*1`
- [x1] family: `3390*1`
    e.g. `3390*1`
- [x1] family: `8060*1`
    e.g. `8060*1`
- [x1] family: `5760*1`
    e.g. `5760*1`
- [x1] family: `9860*1`
    e.g. `9860*1`
- [x1] family: `4490*1`
    e.g. `4490*1`
- [x1] family: `4970*1`
    e.g. `4970*1`
- [x1] family: `9050*1`
    e.g. `9050*1`
- [x1] family: `10865*1`
    e.g. `10865*1`
- [x1] family: `@-2*@`
    e.g. `BS7-2*BU7`
- [x1] family: `9910*1`
    e.g. `9910*1`
- [x1] family: `@*3.28`
    e.g. `CB5*3.28`
- [x1] family: `3940*1`
    e.g. `3940*1`
- [x1] family: `7440*1`
    e.g. `7440*1`
- [x1] family: `2490*1`
    e.g. `2490*1`
- [x1] family: `9949*1`
    e.g. `9949*1`
- [x1] family: `IF(@="-","-",VLOOKUP(MIN(@),@,2,TRUE))`
    e.g. `IF(BP16="-","-",VLOOKUP(MIN(BZ45:BZ53),BZ45:CA53,2,TRUE))`
- [x1] family: `IF(@=1,"High",IF(@=2,"Mid",IF(@=3,"Low")))`
    e.g. `IF($AB$4=1,"High",IF($AB$4=2,"Mid",IF($AB$4=3,"Low")))`
- [x1] family: `6720*1`
    e.g. `6720*1`
- [x1] family: `7590*1`
    e.g. `7590*1`
- [x1] family: `7970*1`
    e.g. `7970*1`
- [x1] family: `PI()*(@/1000)^2/4*@*1000`
    e.g. `PI()*(BT7/1000)^2/4*BW7*1000`

---

## Sheet: SAC   (formula cells: 7278 / total 7278)
- [x2183] family: ``
    e.g. ``
- [x41] family: `IF(@=@,@,0)`
    e.g. `IF($D$9=$D$10,$C$9,0)`
- [x32] family: `IF(@=@,@,"")`
    e.g. `IF($X$27=$X$23,Y46,"")`
- [x30] family: `IF(@="CC","-",@)`
    e.g. `IF($X$30="CC","-",Y8)`
- [x8] family: `IF(@="C","-",@)`
    e.g. `IF($BL$39="C","-",BL6)`
- [x7] family: `IF(SUM(@,@,@,@,@,@,@,)=0,"-",SUM(@,@,@,@,@,@,@,))`
    e.g. `IF(SUM(AK53,AK76,AK99,AK126,AK149,AK172,AK195,)=0,"-",SUM(AK53,AK76,AK99,AK126,AK149,AK172,AK195,))`
- [x6] family: `@&@`
    e.g. `AK46&AK119`
- [x5] family: `IF(@=0,"-",SUM(@))`
    e.g. `IF(C9=0,"-",SUM(AK21:AK25))`
- [x4] family: `@/2.6`
    e.g. `AL21/2.6`
- [x4] family: `@/3.516`
    e.g. `AL22/3.516`
- [x4] family: `@*860`
    e.g. `AL21*860`
- [x3] family: `@&@&@&@&@&@&@`
    e.g. `AK50&AK73&AK96&AK123&AK146&AK169&AK192`
- [x3] family: `@*12000`
    e.g. `AK21*12000`
- [x3] family: `IF(SUM(@,@)=0,"-",SUM(@,@))`
    e.g. `IF(SUM(BU52,BU73)=0,"-",SUM(BU52,BU73))`
- [x3] family: `IF(@=0,"C",VLOOKUP(@,@,2,FALSE))`
    e.g. `IF(H4=0,"C",VLOOKUP(H4,W23:X24,2,FALSE))`
- [x2] family: `@/3412`
    e.g. `AN24/3412`
- [x1] family: `@*3.516`
    e.g. `AK21*3.516`
- [x1] family: `@+@`
    e.g. `BU47+BU68`
- [x1] family: `IF(@=@,"-",2.5)`
    e.g. `IF(H4=W23,"-",2.5)`
- [x1] family: `@*2.6`
    e.g. `AM23*2.6`
- [x1] family: `@/860*3412`
    e.g. `AO25/860*3412`

---

## Sheet: Insulations   (formula cells: 18054 / total 18054)
- [x5452] family: ``
    e.g. ``
- [x5000] family: `0.5*(@+2*@)*LN(1+2*@/@)`
    e.g. `0.5*(S18+2*AQ4)*LN(1+2*AQ4/S18)`
- [x4994] family: `IF(OR(@=@,@>@),@,"")`
    e.g. `IF(OR(AR10=S13,AR10>S13),AR10,"")`
- [x80] family: `@+1`
    e.g. `AQ4+1`
- [x52] family: `IF(@=@,@,0)`
    e.g. `IF($V$26=AB$3,AB10,0)`
- [x7] family: `IF(SUM(@)=0,"-",SUM(@))`
    e.g. `IF(SUM(AB27:AK27)=0,"-",SUM(AB27:AK27))`
- [x6] family: `@*@`
    e.g. `AJ6*AJ7`
- [x4] family: `@*@*@`
    e.g. `AB6*AB7*AB8`
- [x2] family: `IF(@=1,@,IF(@=2,@,IF(@=3,"Any","-")))`
    e.g. `IF(X11=1,W20,IF(X11=2,W21,IF(X11=3,"Any","-")))`
- [x2] family: `IF(@=0,"-",VLOOKUP(@,@,2,FALSE))`
    e.g. `IF(E11=0,"-",VLOOKUP(E11,V23:W24,2,FALSE))`
- [x1] family: `IF(@="Any",1,@)`
    e.g. `IF(E13="Any",1,E13)`
- [x1] family: `IF(@="-","-",ROUNDUP(@,0))`
    e.g. `IF(S13="-","-",ROUNDUP(S13,0))`
- [x1] family: `IF(@=0,"-",MIN(@))`
    e.g. `IF(S17=0,"-",MIN(AP4:AP5003))`
- [x1] family: `IF(@=0,3,MATCH(@,@,0))`
    e.g. `IF(E5=0,3,MATCH(E5,V11:V13,0))`
- [x1] family: `IF(@="-","-",VLOOKUP(@,@,2))`
    e.g. `IF(S21="-","-",VLOOKUP(S21,AP4:AR5003,2))`
- [x1] family: `IF(#REF!=@,TRUE,FALSE)`
    e.g. `IF(#REF!=AM5,TRUE,FALSE)`
- [x1] family: `IF(@="-","-",@*@*@)`
    e.g. `IF(E9="-","-",X11*E9*X23)`
- [x1] family: `IF(@=@,"","at28.8oC,dewpointat27oC")`
    e.g. `IF(X11=W13,"","at 28.8 oC, dew point at 27 oC")`
- [x1] family: `IF(@*@*@*@*@=0,"-",1000*(@/@)*((@-@)/(@-@)))`
    e.g. `IF(S6*S7*S8*S9*S10=0,"-",1000*(S6/S7)*((S8-S9)/(S10-S8)))`
- [x1] family: `IF(@>0,VLOOKUP(@,@,2,FALSE),"-")`
    e.g. `IF(E7>0,VLOOKUP(E7,V15:W17,2,FALSE),"-")`

---

## Sheet: PN   (formula cells: 773 / total 773)
- [x50] family: ``
    e.g. ``
- [x10] family: `IF(@<=@,@,"")`
    e.g. `IF($L$18<=AH8,AH8,"")`
- [x7] family: `@*0.09804139432`
    e.g. `K8*0.09804139432`
- [x6] family: `IF(@*@*@>0,MIN(@),"")`
    e.g. `IF(Q7*N11*L11>0,MIN(AJ8:AJ13),"")`
- [x4] family: `IF(@=0,"Pressurebreakrequired","")`
    e.g. `IF(N17=0,"Pressure break required","")`
- [x4] family: `IF(@=0,"-",SUM(@))`
    e.g. `IF($C$9=0,"-",SUM(AH45:AH48))`
- [x4] family: `IF(@=@,@,0)`
    e.g. `IF($D$9=D10,$C$9,0)`
- [x3] family: `@*0.001`
    e.g. `AJ45*0.001`
- [x3] family: `@/0.09804139432`
    e.g. `AI46/0.09804139432`
- [x2] family: `IF(@*@*@>0,MIN(@),"-")`
    e.g. `IF(H11*L11*N11>0,MIN(AG16:AG21),"-")`
- [x2] family: `IF(@*@*@>0,@+@,"-")`
    e.g. `IF(H11*L11*N11>0,K8+H11,"-")`
- [x2] family: `@-@`
    e.g. `M8-L11`
- [x2] family: `IF(@*@>0,MIN(@),"-")`
    e.g. `IF(N11*L11>0,MIN(AG8:AG13),"-")`
- [x2] family: `IF(@*@>0,@*0.09804139432,"-")`
    e.g. `IF(N11*L11>0,L17*0.09804139432,"-")`
- [x2] family: `@+@`
    e.g. `O8+N11`
- [x2] family: `IF(@*@*@>0,@,"-")`
    e.g. `IF(H11*L11*N11>0,L14,"-")`
- [x2] family: `IF(@*@>0,@,"-")`
    e.g. `IF(N11*L11>0,M8,"-")`
- [x2] family: `IF(@*@*@>0,@*0.09804139432,"-")`
    e.g. `IF(H11*L11*N11>0,L19*0.09804139432,"-")`
- [x2] family: `@/100`
    e.g. `AJ47/100`
- [x2] family: `@*9.804139432`
    e.g. `AH45*9.804139432`
- [x1] family: `@`
    e.g. `Q7`
- [x1] family: `@*1000`
    e.g. `AK48*1000`
- [x1] family: `IF(@=0,@,@)`
    e.g. `IF(AD7=0,AA11,AD7)`

---

## Sheet: NPSH   (formula cells: 729 / total 729)
- [x1] family: `IF(@="-","-",IF(@>=0,"NO","YES"))`
    e.g. `IF(F33="-","-",IF(F33>=0,"NO","YES"))`
- [x1] family: `IF(@>0,@/9.8,"-")`
    e.g. `IF(F14>0,F14/9.8,"-")`
- [x1] family: `@-@`
    e.g. `F17-F18`
- [x1] family: `MATCH(@,@)`
    e.g. `MATCH(C40,C44:C114)`
- [x1] family: `"NPSH"&IF(@>=0,"≥0","≤0")&";Cavitation:"`
    e.g. `"NPSH " &IF(F33>=0,"≥ 0 ","≤ 0") &"; Cavitation:"`
- [x1] family: `IF(@>0,@,"-")`
    e.g. `IF(F23>0,D40,"-")`
- [x1] family: `INDEX(@,@)+(@-INDEX(@,@))*(INDEX(@,@+1)-INDEX(@,@))/(INDEX(@,@+1)-INDEX(@,@))`
    e.g. `INDEX(D44:D114,C41) + (C40-INDEX(C44:C114,C41)) * (INDEX(D44:D114,C41+1)-INDEX(D44:D114,C41)) / (INDEX(C44:C114,C41+1)-INDEX(C44:C114,C41))`
- [x1] family: `@+@`
    e.g. `F20+F19`
- [x1] family: `IF(@="-","-",@/9.8)`
    e.g. `IF(F24="-","-",F24/9.8)`
- [x1] family: `@`
    e.g. `F23`
- [x1] family: `IF(OR(@="-",@="-"),"-",@+@-@-@)`
    e.g. `IF(OR(F15="-",F25="-"),"-",F15+F21-F25-F27)`
- [x1] family: `IF(@="-","-",@-@)`
    e.g. `IF(F29="-","-",F29-F31)`

---

## Sheet: SPF(PRC)   (formula cells: 376 / total 376)
- [x3] family: `IF(@="n/a",@,@)`
    e.g. `IF(C9="n/a",B27,B26)`
- [x1] family: `IF(@>0,IF(@="n/a","","="&ROUNDUP(IF(@="D","n/a",@*@*@),0)),"-")`
    e.g. `IF(C5>0,IF(C9="n/a","","= "&ROUNDUP(IF(C6="D","n/a",C10*C13*C16),0)),"-")`
- [x1] family: `IF(@>0,IF(AND(@>0,@<20),VLOOKUP(@,@,5,FALSE),IF(AND(@>=20,@<=32),VLOOKUP(@,@,8,FALSE))),"-")`
    e.g. `IF(C5>0,IF(AND(C5>0,C5<20),VLOOKUP(C6,$H$7:$L$11,5,FALSE),IF(AND(C5>=20,C5<=32),VLOOKUP(C6,$H$7:$O$11,8,FALSE))),"-")`
- [x1] family: `IF(@>0,IF(AND(@>0,@<20),VLOOKUP(@,@,3,FALSE),IF(AND(@>=20,@<=32),VLOOKUP(@,@,6,FALSE))),"-")`
    e.g. `IF(C5>0,IF(AND(C5>0,C5<20),VLOOKUP(C6,$H$7:$L$11,3,FALSE),IF(AND(C5>=20,C5<=32),VLOOKUP(C6,$H$7:$O$11,6,FALSE))),"-")`
- [x1] family: `IF(@>0,IF(@="D","n/a",IF(@=@,0.75,IF(@=@,1))),"-")`
    e.g. `IF(C5>0,IF(C6="D","n/a",IF(C12=B22,0.75,IF(C12=B23,1))),"-")`
- [x1] family: `IF(AND(@>0,@>0),VLOOKUP(@,@,2,FALSE),"-")`
    e.g. `IF(AND(C5>0,C6>0),VLOOKUP(C6,$H$7:$I$11,2,FALSE),"-")`
- [x1] family: `IF(@>0,IF(@="D","30",IF(AND(@>0,@<20),ABS(((@-@)*(19-@)/(19-1))-@),IF(AND(@>=20,@<=32),ABS(((@-@)*(32-@)/(32-20))-@)))),"-")`
    e.g. `IF(C5>0,IF(C6="D","30",IF(AND(C5>0,C5<20),ABS(((E9-C9)*(19-C5)/(19-1))-E9),IF(AND(C5>=20,C5<=32),ABS(((E9-C9)*(32-C5)/(32-20))-E9)))),"-")`
- [x1] family: `ROUNDUP(@,0)`
    e.g. `ROUNDUP(C10,0)`
- [x1] family: `IF(@>0,IF(@="n/a","30","="&@&"x"&@&"x"&@),"-")`
    e.g. `IF(C5>0,IF(C13="n/a","30","= "&B24&" x "&C13&" x "&C16),"-")`
- [x1] family: `IF(@="n/a","",@)`
    e.g. `IF(C9="n/a","",B26)`
- [x1] family: `IF(@>0,IF(@="D","n/a",IF(@>1,1.5,1)),"-")`
    e.g. `IF(C5>0,IF(C6="D","n/a",IF(C15>1,1.5,1)),"-")`

---

## Sheet: Website   (formula cells: 51 / total 51)

---

## Sheet: Supplier   (formula cells: 10650 / total 10650)

---

