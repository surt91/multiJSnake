package me.schawe.multijsnake.highscore;

import org.springframework.data.repository.CrudRepository;

import java.util.List;

public interface HighscoreRepository extends CrudRepository<Highscore, Long> {
    List<Highscore> findTop10ByOrderByScoreDesc();
    List<Highscore> findTop10ByFieldSizeOrderByScoreDesc(int fieldSize);
}
