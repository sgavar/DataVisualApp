

insert into SurveyResult
([key],CommentKe,CommentLi,CommunicationKe,CommunicationLi,CourtesyKe,CourtesyLi,EndDate,LoadDate,OverallRatingKe,OverallRatingLi,
ResponsivenessKe, ResponsivenessLi,StartDate,code,indicator,outcome,q1,q2,q3,q4,q5,q6,q7,q8,q9, q10,q11,q12,q13,q14,q15,q16,q17,q18,q19,q20,
wesId)
Values(NEWID(),'great survey',
'cool survey',
0.74,
0.91,
0.74,
0.74,
'2016-08-15',
GETDATE(),
8.8,
7.6,
0.60,
0.55,
'2016-08-01',
'VA',
'1-10-10011',
'Comp',
2,1,3,'Not sure',1,1,3,2,1,1,2,2,3,2,1,1,1,1,7,
'Great','10011');