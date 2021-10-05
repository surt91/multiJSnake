package me.schawe.multijsnake.highscore;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import java.util.Date;

@Entity
public class Highscore {
    private @Id @GeneratedValue Long id;
    private int score;
    private String playerName;
    private Date date;
    private int fieldSize;

    public Highscore(int score, String playerName, int fieldSize, Date date) {
        this.score = score;
        this.playerName = playerName;
        this.fieldSize = fieldSize;
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

    public int getFieldSize() {
        return fieldSize;
    }

    public Date getDate() {
        return date;
    }

    @Override
    public String toString() {
        return "Highscore{" +
                "id=" + id +
                ", score=" + score +
                ", playerName='" + playerName + '\'' +
                ", fieldSize=" + fieldSize +
                ", date=" + date +
                '}';
    }
}
