module Server exposing (..)

import Dict
import DomainTypes exposing (..)
import Http
import Iso8601
import Json.Decode as Decode
import Json.Decode.Pipeline as Pipeline
import Json.Encode
import PosixUtils exposing (..)
import Random
import Time



-------------------------------------------------
-- HTTP
-------------------------------------------------


getDecks : (Result Http.Error (List Deck) -> msg) -> Cmd msg
getDecks msg =
    Http.get
        { url = "decks.json"
        , expect = Http.expectJson msg (Decode.list deckDecoder)
        }


postDecks : List Deck -> Time.Posix -> (Result Http.Error () -> msg) -> Cmd msg
postDecks decks now msg =
    case generateDeckUpdates decks now of
        [] ->
            Cmd.none

        updates ->
            Http.post
                { url = "decks"
                , body = updates |> Json.Encode.list encodeDeckUpdate |> Http.jsonBody
                , expect = Http.expectWhatever msg
                }



-------------------------------------------------
-- decoders
-------------------------------------------------


deckDecoder : Decode.Decoder Deck
deckDecoder =
    Decode.succeed Deck
        |> Pipeline.required "filename" Decode.string
        |> Pipeline.required "cards" (Decode.list cardDecoder)


cardDecoder : Decode.Decoder Card
cardDecoder =
    Decode.succeed Card
        |> Pipeline.required "question" Decode.string
        |> Pipeline.required "answer" Decode.string
        |> Pipeline.required "last" Iso8601.decoder
        |> Pipeline.hardcoded Neutral



-------------------------------------------------
-- encoders
-------------------------------------------------


type alias CardUpdate =
    { mark : Int
    , next : String
    }


type alias DeckUpdate =
    { filename : String
    , updates : Dict.Dict String CardUpdate
    }


encodeCardUpdate : CardUpdate -> Json.Encode.Value
encodeCardUpdate cardUpdate =
    Json.Encode.object
        [ ( "mark", Json.Encode.int cardUpdate.mark )
        , ( "next", Json.Encode.string cardUpdate.next )
        ]


encodeDeckUpdate : DeckUpdate -> Json.Encode.Value
encodeDeckUpdate deckUpdate =
    Json.Encode.object
        [ ( "filename", Json.Encode.string deckUpdate.filename )
        , ( "updates", Json.Encode.dict identity encodeCardUpdate deckUpdate.updates )
        ]


generateDeckUpdates : List Deck -> Time.Posix -> List DeckUpdate
generateDeckUpdates decks now =
    let
        seed =
            now |> Time.posixToMillis |> Random.initialSeed

        -- "doubling" d : d * 1.8..2.2
        doubleSpacedGenerator d =
            Random.int (18 * d // 10) (22 * d // 10)

        updateForCard currentSeed card =
            case card.grade of
                Neutral ->
                    ( seed, [] )

                Passed ->
                    let
                        ( days, newSeed ) =
                            Random.step (daysBetween now card.last |> doubleSpacedGenerator) currentSeed
                    in
                    ( newSeed, [ ( card.question, { mark = 1, next = days |> addDays now |> isoDay } ) ] )

                Failed ->
                    ( seed, [ ( card.question, { mark = 0, next = isoDay now } ) ] )

        updatesForDeck currentSeed deck =
            let
                ( nextSeed, deckUpdates ) =
                    mapWithSeed currentSeed updateForCard deck.cards
            in
            ( nextSeed
            , { filename = deck.filename, updates = deckUpdates |> List.concat |> Dict.fromList }
            )
    in
    decks
        |> mapWithSeed seed updatesForDeck
        |> Tuple.second
        |> List.filter (not << Dict.isEmpty << .updates)


mapWithSeed : Random.Seed -> (Random.Seed -> a -> ( Random.Seed, b )) -> List a -> ( Random.Seed, List b )
mapWithSeed seed fn list =
    List.foldr
        (\item ( currentSeed, acc ) ->
            let
                ( nextSeed, mappedItem ) =
                    fn currentSeed item
            in
            ( nextSeed, mappedItem :: acc )
        )
        ( seed, [] )
        list
