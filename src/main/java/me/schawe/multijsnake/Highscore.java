package me.schawe.multijsnake;

import javax.persistence.Entity;
import javax.persistence.EntityListeners;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import java.util.Date;

@EntityListeners(HighscoreEventHandler.class)
@Entity
public class Highscore {
    private @Id @GeneratedValue Long id;
    private int score;
    private String playerName;
    private Date date;

    public Highscore(int score, String playerName, Date date) {
        this.score = score;
        this.playerName = playerName;
        this.date = date;
    }

    public Highscore() {
    }

    public int getScore() {
        return score;
    }

    public String getPlayerName() {
        return playerName;
    }

    public Date getDate() {
        return date;
    }
}
