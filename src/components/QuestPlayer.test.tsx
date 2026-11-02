import { it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { QuestPlayer } from './QuestPlayer';
import { initialState } from '../game/engine';
import { quests } from '../game/content';
function render(questId: string, index: number, answer: string[], correct: boolean) {
 const q = quests.find(q => q.id === questId)!.questions[index];
 const state = initialState();
 state.session = {id:'test',questId,index,version:'1',selection:answer,hinted:false,reviewToken:null,answers:[]};
 state.session.answers[index] = {questionId:q.id,answer,correct,hinted:false};
 return renderToStaticMarkup(<QuestPlayer state={state} act={async()=>{}} busy={false} pause={()=>{}}/>);
}
it('marks an incorrect selection explicitly and identifies the missed answer',()=>{
 const html = render('q1',0,['b'],false);
 expect(html).toContain('Nicht richtig');
 expect(html).toContain('Deine Antwort: falsch');
 expect(html).toContain('Richtig, nicht ausgewählt');
 expect(html).toContain('wrong-answer');
});
it('evaluates order by position instead of painting every item green',()=>{
 const html = render('q1',2,['a','b','c'],false);
 expect(html).toContain('Falsche Position');
 expect(html).toContain('Richtige Reihenfolge:');
});
it('uses different observable details for every scene',()=>{
 expect(render('q2',0,['a','b'],true)).toContain('Abplatzungen');
 expect(render('q4',1,['a','b'],true)).toContain('Vorher');
 expect(render('boss',1,['a','b'],true)).toContain('verwischt');
});
