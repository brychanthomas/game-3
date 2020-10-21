import { AScene } from './scenes.js';

/** Object with score and username properties. */
interface scoreObject {
  score: integer;
  username: string;
}

export class ScoreScene extends AScene {

  private scores: scoreObject[];

  constructor() {
    super('score');
  }

  /**
   * Used to pass the scores data to the scene from multiplayerHandler.
   */
  init(scores: scoreObject[]) {
    this.scores = scores.sort((p1, p2) => p2.score - p1.score);
    //this.scores
  }

  create() {
    this.add.text(240, 60, "Scores", {fontSize: '32px', fontFamily:"Arial Black"});
    for(var i=0; i<this.scores.length; i++) {
      this.add.text(240, 110+(20*i), i+1+':');
      this.add.text(270, 110+(20*i),
        this.scores[i].score.toString().padStart(2, "0")+' - '+this.scores[i].username);
    }
  }
}
