module.exports=function(app,db){
 app.get("/api/v8/health",(req,res)=>{try{const recordCount=db.prepare("SELECT COUNT(*) AS n FROM call_prep_results").get().n;const answerCount=db.prepare("SELECT COUNT(*) AS n FROM call_question_answers").get().n;const auditCount=db.prepare("SELECT COUNT(*) AS n FROM prep_query_audit").get().n;res.json({status:"running",version:"8",record_count:recordCount,answer_count:answerCount,audit_count:auditCount})}catch(e){res.status(500).json({error:e.message})}});
};
